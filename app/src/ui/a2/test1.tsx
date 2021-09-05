import * as React from 'react'

export class Test1 extends React.Component<any, any> {
  public render() {
    return (
      <div>
        test1
        <div>{this.props.children}</div>
      </div>
    )
  }
}
