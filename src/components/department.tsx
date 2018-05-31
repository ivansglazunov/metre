import * as React from 'react';

export default class Department extends React.Component<any> {
  static defaultProps = {
  };
  render() {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={this.props.logo} width={30}/>
      <br/>
      <h5>{this.props.title}</h5>
    </div>;
  }
}