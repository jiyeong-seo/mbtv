import React from "react";
import { ImageAnalyze } from "../imageAnalyze/ImageAnalyze";

const { Provider, Consumer } = React.createContext();
export { Consumer }

class ContextApi extends React.Component {
  constructor(props) {
    super(props);
    this.setStateFunc = this.setStateFunc.bind(this);
  }
  
  setStateFunc(value) {
    this.setState({mbti: value});
  }

  render() {
    const content = {
      ...this.state,
      setStateFunc: this.setStateFunc
    }

    return (
      <Provider value={content}>
        <ImageAnalyze/>
      </Provider>
    )
  }
}

export default ContextApi;