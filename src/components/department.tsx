import * as React from 'react';

export default class Department extends React.Component<any> {
  static defaultProps = {
    link:'#'
  };
  render() {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <a href={this.props.link}><img src={this.props.logo} style={{display:'block', margin:'0 auto'}} width={80}/>
      <br/>
      <h5>{this.props.title}</h5></a>
    </div>;
  }
}