import * as React from 'react';

export default class Fillimage extends React.Component<any> {
  static defaultProps = {
    keepOriginalImgSize: false,
    imgSize: 'cover',
    width: '100%',
    height: '100%',
    positionX: 'center',
    positionY: 'center'
  };
  render() {
      var bgSize = this.props.imgSize;
      if (!(['cover','contain'].indexOf(bgSize) > -1)) bgSize = 'cover';
      if (this.props.keepOriginalImgSize) bgSize = 'auto';
      var positionX = this.props.positionX;
      if (!(['left','center','right'].indexOf(positionX) > -1)) positionX = 'center';
      var positionY = this.props.positionY;
      if (!(['top','center','bottom'].indexOf(positionY) > -1))  positionY = 'center';
      return <div 
        style={{
          width: this.props.width,
          height: this.props.height,
          backgroundImage: 'url('+this.props.imgSrc+')',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: positionX+' '+positionY,
          backgroundSize: bgSize,
          position: 'relative',
          ...this.props.style,
        }}
        {...this.props.props}
      >{this.props.children}</div>;
  }
}
