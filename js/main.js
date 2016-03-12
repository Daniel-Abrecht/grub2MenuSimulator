"use strict";

for( let canvas of Array.prototype.slice.call(document.querySelectorAll("canvas[data-grub-theme]")) )
(function(){

  const GMS = new GrubMenuSimulator( canvas );

  GMS.loadModel(canvas.dataset.grubTheme);

  canvas.GMS = GMS;

  addEventListener( "resize", resize );

  setInterval(resize,500);
  setTimeout(resize,0);
  resize();
  loop();

  function resize(){
    GMS.resize(
      canvas.offsetWidth,
      canvas.offsetHeight
    );
  }

  function loop(){
    GMS.draw();
    requestAnimationFrame(loop);
  }

})();