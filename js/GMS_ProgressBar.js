"use strict";

class GSM_ProgressBar extends GSM_Component {

  constructor( GSM, config, parent ){
    super( GSM, config, parent );
    super.setupProperties({
      "bg_color": "",
      "fg_color": "",
      "start": 0,
      "end": 1,
      "value": 0,
      "border_color": "",
      "text_color": "",
      "show_text": true,
      "text": ""
    });
  }

  draw( ctx, width, height ){

    var amount = ( this.value - this.start ) / ( this.end - this.start );

    if( this.bg_color ){
      ctx.beginPath();
      ctx.rect(0,0,width,height);
      ctx.fillStyle = this.bg_color;
      ctx.fill();
    }

    if( this.fg_color ){
      ctx.beginPath();
      ctx.rect(0,0, width*amount,height);
      ctx.fillStyle = this.fg_color;
      ctx.fill();
    }

  }

}

GrubMenuSimulator.registerComponent( "progress_bar", GSM_ProgressBar );
