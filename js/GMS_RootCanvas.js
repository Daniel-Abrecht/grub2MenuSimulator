"use strict";

class GSM_RootCanvas extends GSM_Canvas {

  constructor( GSM, config ){
    super( GSM, config, parent );
    super.setupProperties({
      "desktop-color": "",
      "desktop-image": "",
      "message-bg-color": "",
      "message-color": "",
      "message-font": "",
      "title-color": "",
      "terminal-box": ""
    });
  }

  draw( ctx, width, height ){

    if(this['desktop-color']){
      ctx.beginPath();
      ctx.rect( 0, 0, width, height );
      ctx.fillStyle = this['desktop-color'];
      ctx.fill();
    }

    let bgimg = this.GSM.getImage(this['desktop-image']);
    if( bgimg ){
      ctx.drawImage( bgimg, 0, 0, width, height );
    }

  }

}

GrubMenuSimulator.registerComponent( "root canvas", GSM_RootCanvas );
