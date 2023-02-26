//@ts-nocheck
import Chat from "./chat/Chat";
import styled, { css, keyframes } from "styled-components";
import { useEffect, useRef, useState } from "react";
import Cropper from "react-cropper"
import "cropperjs/dist/cropper.css";
import { ImageAnalyze } from "./imageAnalyze/ImageAnalyze";

import sun from "./assets/images/mainback/sun.png";

function App(): JSX.Element {
  const modalRef = useRef<HTMLDivElement>();
  const inputRef = useRef<HTMLInputElement>(null);

  const [mbti, setMbti] = useState<string>('');
  console.log('mbti', mbti)
  const [modal, setModal] = useState<boolean>(false);
  const [image, setImage] = useState();
  const [cropData, setCropData] = useState<any>();
  const [cropper, setCropper] = useState<any>();

  const handleModal = () => {
    setModal(!modal)
  }

  // modal 바깥 클릭하면 닫히는 함수
  useEffect(() => {
    const clickOutside = (e: any) => {
      if (modal && modalRef.current && !modalRef.current.contains(e.target)) {
        setModal(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => {
      document.removeEventListener("mousedown", clickOutside);
    }
  }, [modal]);

  const onChange = (e: any) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as any);
    };
    reader.readAsDataURL(files[0]);
  };

  // 이미지 선택 범위만큼만 잘라서, 새로운 base64 encoded File 리턴해주는 함수
  const getCropData = () => {
    if (typeof cropper !== "undefined") {
      setCropData(cropper.getCroppedCanvas().toDataURL());
    }
  };

  return (
    <MainWrapper>
      <MainContentWrapper ref={modalRef}>
        <StTitle>관상으로 알아보는 MBTI</StTitle>
        <StModalBtn onClick={handleModal}>
          { cropData ? <StCropedImg id="srcImage" src={cropData} alt="srcImg" /> : <div>+</div> }
        </StModalBtn>
        {
          modal ? 
          <StModal>
          <section>
            <header>최대한 얼굴만 담아야 더 정확함</header>
            <main>
              <section>
                <input type="file" style={{display: "none"}} ref={inputRef} onChange={onChange} />
                <StCropperBorder>
                  <Cropper
                    style={{ height: 300, width: "375px", zIndex: "2" }}
                    // zoomTo={0.2}
                    initialAspectRatio={1}
                    preview=".img-preview"
                    src={image}
                    viewMode={1}
                    minCropBoxHeight={10}
                    minCropBoxWidth={10}
                    background={false}
                    responsive={true}
                    autoCropArea={1}
                    checkOrientation={false}
                    onInitialized={(instance) => {
                      setCropper(instance);
                    }}
                    guides={true}
                  />
                </StCropperBorder>
              </section>
              <button onClick={() => inputRef.current.click()}>이미지 등록</button>
            </main>
            <footer>
            <button
              onClick={() => {
                getCropData();
                setModal(false);
              }}
            >
              Get Cropped Image
            </button>
            </footer>
          </section>
        </StModal> : 
            null
        }
        <ImageAnalyze cropData={cropData} setMbti={setMbti} />
        <Chat />
      </MainContentWrapper>
    </MainWrapper>
  );
}
export default App;

const MainWrapper = styled.div`
  ${({ mbtiResult }) => {
    console.log(mbtiResult);
    switch (mbtiResult) {
      case "undefined":
        return css`
          background-color: #f6f6f6;
        `;
      case "ESFP":
      case "ISTP":
      case "ISFP":
      case "ESTP":
        return css`
          background-color: #f9eed7;
        `;
      case "INFJ":
      case "INFP":
      case "ENFJ":
      case "ENFP":
        return css`
          background-color: #d6ece3;
        `;
      case "INTJ":
      case "INTP":
      case "ENTJ":
      case "ENTP":
        return css`
          background-color: #e7dfea;
        `;
      case "ISTJ":
      case "ISFJ":
      case "ESTJ":
      case "ESFJ":
        return css`
          background-color: #d9eaf0;
        `;

      default:
        break;
    }
  }}
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: start;
  background-image: url(${sun});
  background-repeat: no-repeat;
  background-size: contain;
  overflow: scroll;
`;

const MainContentWrapper = styled.main`
  background-color: #fff;
  width: 375px;
  height: 100vh;
`;

const StTitle = styled.h1`
  font-size: 30px;
  text-align: center;
  margin: 2rem;
  margin-bottom: 5rem;
`
const StModalBtn = styled.button`
  display: flex;
  margin: auto;
  border: 1px solid black;
  padding: 1rem;
  cursor: pointer;
  width: 80%;
  justify-content: center;
  & div {
    height: 200px;
    width: 200px;
    border-radius: 100px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    transition: all 0.5s;
    color: black;
    font-size: 100px;
    &:hover {
      color:#29eb93;
    }
  }
`

const showModal = keyframes`
  from {
    opacity: 0;
    margin-top: -50px;
  }
  to {
    opacity: 1;
    margin-top: 0;
  }
`

const StModal = styled.div`
  width: 375px;
  height: fit-content;
  position: absolute;
  bottom: 700px;
  & section {
    width: 90%;
    max-width: 450px;
    margin: 0 auto;
    border-radius: 0.3rem;
    background-color: #fff;
    animation: ${showModal} 0.3s;
    overflow: hidden;
    & header {
      position: relative;
      padding: 16px 64px 16px 16px;
      background-color: #f1f1f1;
      font-weight: 700;
    }
    & main {
      padding: 16px;
      border-bottom: 1px solid #dee2e6;
      border-top: 1px solid #dee2e6;
    }
    & footer {
      padding: 12px 16px;
      text-align: right;
    }
  }
`

const StCropperBorder = styled.div`
  border: 1px solid black;
  z-index: 1;
  margin-bottom: 5rem;
`

const StCropedImg = styled.img`
  width: 290px;
  height: 290px;
  display: block;
  margin: auto;
`