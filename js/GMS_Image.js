"use strict";

class GSM_Image extends GSM_Component {

  constructor( GSM, config, parent ){
    super( GSM, config, parent );
    super.setupProperties({
      "file": ""
    });
  }

  getWidth(){
    if(this.width)
      return this.width;
    var img = this.GSM.getImage(this['file']);
    if(!img)
      return [0,0];
    var w = ( img.naturalWidth  || img.width  ) |0;
    return [0,w];
  }

  getHeight(){
    if(this.height)
      return this.height;
    var img = this.GSM.getImage(this['file']);
    if(!img)
      return [0,0];
    var h = ( img.naturalHeight || img.height ) |0;
    return [0,h];
  }

  draw( ctx, width, height ){
    let bgimg = this.GSM.getImage(this['file']);
    if( bgimg ){
      ctx.drawImage( bgimg, 0, 0, width, height );
    }

  }

}

GrubMenuSimulator.registerComponent( "image", GSM_Image );
