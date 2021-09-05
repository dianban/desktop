import * as React from 'react'
import { Link } from 'react-router-dom'

export class Test1 extends React.Component<any, any> {
  private test = () => {
    console.log(window.location)
  }

  private prev = () => {
    console.log(window.location)
    try {
      this.props.history.goBack()
    } catch (e) {
      console.log(e.message)
    }
  }

  public render() {
    return (
      <div>
        <br />
        <br />
        <br />
        test1
        <button onClick={this.test}>test</button>
        <button onClick={this.prev}>prev</button>
        <Link to="/">---/---</Link>
        <br />
        <Link to="/t1">---t1---</Link>
        <div>{this.props.children}</div>
      </div>
    )
  }
}
