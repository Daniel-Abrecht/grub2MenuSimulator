"use strict";

class GSM_Component {

  constructor( GSM, config, parent ){

    this.GSM = GSM;
    this.config = config;
    this.parent = parent || null;

    this.setupSizeProperties({
      top:    null,
      left:   null,
      width:  null,
      height: null
    });

    this.children = [];
    this.force_width = false;
    this.force_height = false;

  }

  setupSizeProperties(defaults){
    for( let prop in defaults )
      if( this.config.has(prop) ){
        this[prop] = ParseSize( this.config.get(prop) );
      }else{
        this[prop] = defaults[prop];
      }
  }

  setupProperties(defaults){
    for( let prop in defaults ){
      let res = this.config.get(prop) || defaults[prop] || null;
      switch( typeof defaults[prop] ){
        case "string": res = res || ""; break;
        case "number": res = +(Number(res)||0); break;
        case "boolean": res = !!res; break;
      }
      this[prop] = res;
    }
  }

  drawAll( ctx, width, height ){
    width  = width |0;
    height = height|0;
    this.draw( ctx, width, height );
    this.drawChildren( ctx, width, height );
  }

  draw( ctx, width, height ){}

  drawChildren( ctx, width, height ){
    for( let child of this.children ){
      let v = child.getViewport( width, height );
      if(this.force_width)
        v[2] = v[4] = width;
      if(this.force_height)
        v[3] = v[5] = height;
      ctx.save();
      ctx.transform(1,0,0,1,v[0],v[1]);
      ctx.beginPath();
      ctx.rect(0,0,v[2],v[3]);
      ctx.clip();
      child.drawAll(ctx,v[2],v[3]);
      ctx.restore();
    }
  }

  drawImageBox( ctx, src, x, y, w, h ){
    x=x|0; y=y|0;
    w=w|0; h=h|0;
    var parts = src.split("*");
    var images = [];

    for( let pos of [
      "nw", "n", "ne",
       "w", "c",  "e",
      "sw", "s", "se"
    ]) images.push(
      this.GSM.getImage(parts.join(pos))
    );

    var borderSizes = [0,0,0,0]; // t,l,b,r
    var sides = [
      [0,1,2], [6,7,8],
      [2,5,8], [0,3,6]
    ];
    for( let i=0; i<sides.length; i++ )
      for( let image of sides[i] ){
        let img = images[image];
        if(img)
          borderSizes[i] = Math.max(
            borderSizes[i],
            (i%2) ? img.naturalWidth||img.width||0 : img.naturalHeight||img.height||0
          )|0;
      }

    for( let i=0; i<images.length; i++ ){
      let img = images[i];
      if(!img) return;
      let ix, iy;
      let iw = ( img.naturalWidth ||img.width ||0 )|0;
      let ih = ( img.naturalHeight||img.height||0 )|0;
      switch( i % 3 ){ // column
        case 0: {
          ix = borderSizes[1] - iw;
        } break;
        case 1: {
          iw = w - (borderSizes[1] + borderSizes[3] |0);
          ix = borderSizes[1];
        } break;
        case 2: {
          ix = w - borderSizes[3];
        } break;
      }
      switch( i/3|0 ){ // row
        case 0: {
          iy = borderSizes[0] - ih;
        } break;
        case 1: {
          ih = h - (borderSizes[0] + borderSizes[2] |0);
          iy = borderSizes[0];
        } break;
        case 2: {
          iy = h - borderSizes[2];
        } break;
      }
      ctx.drawImage( img, ix|0, iy|0, iw|0, ih|0 );
    }

    return {
      border: {
        top: borderSizes[0],
        left: borderSizes[1],
        bottom: borderSizes[2],
        right: borderSizes[3]
      }
    };
  }

  getWidth(){
    return this.width || [1,0];
  }

  getHeight(){
    return this.height || [1,0];
  }

  getViewport( pw, ph ){
    var width  = this.getWidth();
    var height = this.getHeight();
    var viewport = [
      pw * this.left[0] + this.left[1] |0,
      ph * this.top [0] + this.top [1] |0,
      pw * width [0] + width [1] |0,
      ph * height[0] + height[1] |0,
      pw|0, ph|0
    ];
    return viewport;
  }

  add(member){
    this.children.push(member);
  }

}
