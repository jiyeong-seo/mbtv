import styled from "styled-components";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface resultProps {
  mbtiData: string[];
  proData: number[];
}

export const Result = ({mbtiData, proData}: resultProps) => {
  console.log("@@", mbtiData)
  console.log("@@", proData)

  const data = [
    {
      name: mbtiData[0],
      probability: proData[0]
    },
    {
      name: mbtiData[1],
      probability: proData[1]
    },
    {
      name: mbtiData[2],
      probability: proData[2]
    }
  ]

  return (
    <StResultContainer>
      <BarChart      
        width={275}
        height={250}
        margin={{
          top: 20,
          right: 20,
          left: 50,
          bottom: 20
        }}
        data={data}
      >
        <XAxis dataKey={"name"} scale={"point"} padding={{ left: 20, right: 20 }}/>
        <Tooltip/>
        <Legend/>
        <CartesianGrid strokeDasharray="3 3" />
        <Bar dataKey="probability" fill="#232323" background={{ fill: "#eee" }} />
      </BarChart>
    </StResultContainer>
  )
}

const StResultContainer = styled.div`
  width: 100%;
  background-color: tomato;
  padding: 1rem;
  margin-bottom: 50rem;
`