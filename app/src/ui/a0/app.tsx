import * as React from 'react'

export class App extends React.Component<any, any> {
  public render() {
    return (
      <div className="home-app">
        <div className="page-container">{this.props.children}</div>
      </div>
    )
  }
}
