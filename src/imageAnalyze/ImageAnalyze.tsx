import { useState, useEffect, useCallback, createContext, useContext } from "react";
import * as tmImage from "@teachablemachine/image";
import { Result } from "../result/Result";
import { Consumer } from "../context/contextProvider";

interface Props {
  cropData: string;
  setMbti: Function;
}

export interface Predictions {
  [index: number]: { className: string; probability: number };
}

const MBTIContext = createContext<string>('');

export const ImageAnalyze = (cropData: Props): JSX.Element => {
  // 상태값들
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [predictions, setPredictions] = useState<Predictions>();
  const [result, setResult] = useState<string | undefined>();

  const URL = "https://teachablemachine.withgoogle.com/models/vbRGHtXJy/";
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  let model: any;

  const init = useCallback(async () => {
    model = await tmImage.load(modelURL, metadataURL);
    if (model) {
      console.log("분석 준비 끝");
      setIsLoading(true);
    }
  }, []);

  const predict = useCallback(async() => {
    const temp = document.getElementById('srcImage');
    // const temp = cropData;
    const prediction = await model?.predict(temp, false);
    prediction.sort((a: any, b: any) => b.probability - a.probability);
    setPredictions(prediction);
    setShowResult(true);
    setIsLoading(false);
    setResult(prediction[0].className);
    // setMbti(prediction[0].className);
  }, [model])

  useEffect(() => {
    setMbtiData([]);
    setProData([]);
    predict();
    init();
  }, [init]);

  useEffect(() => {
    setMbtiData([]);
    setProData([]);
    if (predictions) {
      for (let i = 0; i < 3; i++) {
        setMbtiData((mbtiData) => {
          return [...mbtiData, predictions[i]?.className];
        });
        setProData((proData) => {
          return [
            ...proData,
            Math.round(predictions[i]?.probability * 10000) / 100.0,
          ];
        });
      }
    }
  }, [predictions]);

  useEffect(() => {
    window.localStorage.setItem("MBTI", JSON.stringify(result));
  });



  const [mbtiData, setMbtiData] = useState<string[]>([]);
  const [proData, setProData] = useState<number[]>([]);

  useEffect(() => {
    setMbtiData([]);
    setProData([]);
    if (predictions) {
      for (let i = 0; i < 3; i++) {
        setMbtiData((mbtiData) => {
          return [...mbtiData, predictions[i]?.className]
        })
        setProData((proData) => {
          return [...proData, Math.round(predictions[i]?.probability * 10000)/ 100.0]
        })
      }
    }
  }, [predictions])

  useEffect(() => {
    window.localStorage.setItem("MBTI", JSON.stringify(result))
  })

  return (
    <div>
      <button onClick={() => {
        predict();
      }}>분석하기</button>
      {
        predictions ? 
          <>
            <h1 id="MBTI">{predictions[0]?.className}%</h1> 
            <h4>{(predictions[0]?.probability * 100).toFixed(2)}%</h4> 
            <h2>{predictions[1]?.className}%</h2> 
            <h4>{(predictions[1]?.probability * 100).toFixed(2)}%</h4> 
            <h2>{predictions[2]?.className}%</h2> 
            <h4>{(predictions[2]?.probability * 100).toFixed(2)}%</h4> 
          </>: 
        null
      }
      {
        predictions ?
          <Result mbtiData={mbtiData} proData={proData}/> : null
      }
    </div>

  );
};