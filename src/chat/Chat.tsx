//@ts-nocheck
import { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import styled, { css } from "styled-components";

const BASE_URL = process.env.REACT_APP_SERVER;

const Chat = (): JSX.Element => {
  const scrollRef = useRef<HTMLDivElement | any>(null);
  const [chatListSize, setChatListSize] = useState(true);
  const [chattings, setChattings] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [participant, setParticipant] = useState("");
  // 유저 닉네임이 나일 경우 우측으로 빼두기
  // 리렌더링시 Chat 컴포넌트의 리렌더링을 막는 방법은 없을까?
  // console.log("inputValue ==>", inputValue)
  // any 말고 다른 타입을 사용할 수 없을까?
  const stompClient = useRef<any>(null);

  // 유저 닉네임 요청 API
  const {
    data: user,
    refetch,
  }: { data: string | undefined; status: string | undefined; refetch: any } =
    useQuery(
      ["getNickname"],
      async () => {
        const {
          headers: { accessuser },
        } = await axios.post(`${BASE_URL}/log/access`, {});
        console.log("nickname response =====>", accessuser);
        return accessuser;
      },
      {
        enabled: false,
      }
    );

  // 첫 렌더링시 기존 채팅 데이터 요청 API
  const { data: prevChattings }: { data: any; isLoading: any } = useQuery(
    ["getPrevChattings"],
    async () => {
      const { data } = await axios.get(`${BASE_URL}/access/greeting`);
      console.log("응답!! ==>", data);

      return data;
    }
  );

  useEffect(() => {
    if (prevChattings) {
      setChattings((prev): any => {
        return [...prev, ...prevChattings];
      });
    }
  }, [prevChattings]);

  useEffect(() => {
    refetch();

    const socket = new SockJS(`${BASE_URL}/mbtv-chat`);
    stompClient.current = Stomp.over(socket);

    stompClient.current.connect({}, () => {
      // 세션아이디! -> 내일 일어나서
      let sessionId = socket._transport.url;
      console.log("세션아이디", sessionId);

      let chat_subscription = stompClient.current.subscribe(
        "/topic/greetings",
        (data: any) => {
          const newMessage = JSON.parse(data.body);
          console.log("새 메시지! =>", typeof newMessage.body);
          setChattings((prev): any => {
            return [...prev, newMessage.body];
          });
        }
      );

      let chat_participant = stompClient.current.subscribe(
        "채팅장 입장시 알림창 url // 혹은 사람수 // 입장시 send // 클린업에서 - send",
        () => {
          // 알림 state 만들어서 출력되도록 하기 => 혹은 위에 구독에서 출력하기
        }
      );

      console.log(
        "chat_subscription 구독 결과 (내일 보기) =====>",
        chat_subscription
      );
    });

    return () => {
      stompClient.current.disconnect();
    };
  }, []);

  // 채팅창 최초 렌더링 / 새로운 채팅 메세지 발생시 스크롤 제어
  useEffect(() => {
    scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chattings]);

  return (
    <>
      <ChatWrapper>
        <ChatList
          onClick={() => {
            console.log("클릭!");
            setChatListSize((prev) => !prev);
          }}
          size={chatListSize ? "small" : "large"}
        >
          {chattings.map((item: any) => {
            return (
              <ChatItem
                messageType={item.user === user ? "me" : "other"}
                key={item?.greetingId}
              >
                <dl>
                  <dt className="sr-only">유저 닉네임</dt>
                  <ChatUser>{item?.user}</ChatUser>
                </dl>
                <dl>
                  <dt className="sr-only">채팅 내용</dt>
                  <ChatMessage>{item?.content}</ChatMessage>
                </dl>
                <dl>
                  <dt className="sr-only">시간</dt>
                  <ChatTime messageType={item.user === user ? "me" : "other"}>
                    {item?.greetingTime}
                  </ChatTime>
                </dl>
              </ChatItem>
            );
          })}
          <div ref={scrollRef} style={{ height: "45px" }} />
        </ChatList>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            stompClient.current.send(
              "/app/hello",
              {},
              JSON.stringify({
                content: inputValue,
                user,
              })
            );

            setInputValue("");
          }}
        >
          <ChatInput
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            value={inputValue}
          />
          <ChatButton type="submit">전송</ChatButton>
        </form>
      </ChatWrapper>
    </>
  );
};

export default Chat;

const ChatWrapper = styled.section`
  width: 375px;
  position: fixed;
  bottom: 0;
`;

const ChatList = styled.ul`
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 10px 20px 10px 20px;
  overflow: scroll;
  ::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera*/
  }
  transition: height 600ms;
  opacity: 0.9;

  ${({ size }) => {
    switch (size) {
      case "small":
        return css`
          height: 215px;
          background-color: #29eb93;
        `;
      case "large":
        return css`
          height: 535px;
          background-color: #29eb93;
        `;
      default:
        break;
    }
  }}
`;

const ChatItem = styled.li`
  position: relative;
  width: 170px;
  padding: 11px 11px;
  border-radius: 11px;
  margin: 26px 0;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;

  ${({ messageType }) => {
    switch (messageType) {
      case "me":
        return css`
          background-color: #f8ff95;
          margin-left: auto;
          text-align: end;
          ::before {
            content: "";
            border-top: 15px solid #f8ff95;
            border-left: 15px solid transparent;
            position: absolute;
            right: 10px;
            bottom: -10px;
          }
        `;
      case "other":
        return css`
          background-color: #fff;
          ::before {
            content: "";
            border-top: 15px solid #fff;
            border-right: 15px solid transparent;
            position: absolute;
            left: -10;
            bottom: -10px;
          }
        `;
      default:
        break;
    }
  }}
`;

const ChatUser = styled.dd`
  color: #797979;
  font-size: 13px;
  padding-bottom: 4px;
`;

const ChatMessage = styled.dd`
  font-size: 14px;
  font-weight: 500;
  color: #3e3d3d;
`;

const ChatTime = styled.dd`
  ${({ messageType }) => {
    switch (messageType) {
      case "me":
        return css`
          position: absolute;
          left: -65px;
          bottom: 6px;
          font-size: 11px;
          color: #5c5b5b;
        `;
      case "other":
        return css`
          position: absolute;
          right: -65px;
          bottom: 6px;
          font-size: 11px;
          color: #5c5b5b;
        `;
      default:
        break;
    }
  }}
`;

const ChatInput = styled.input`
  width: 300px;
  height: 50px;
  padding: 10px 25px;
  background-color: aliceblue;
  opacity: 0.7;
  position: absolute;
  bottom: 0;
`;

const ChatButton = styled.button`
  width: 75px;
  height: 50px;
  background-color: #fffc53;
  opacity: 0.9;
  position: absolute;
  bottom: 0;
  right: 0;
  color: #575555;
  font-size: 14px;
  &:hover {
    background-color: #fdfb82;
    color: #1b1a1a;
  }
`;
