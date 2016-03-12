"use strict";

class GSM_BootMenu extends GSM_Component {

  constructor( GSM, config, parent ){
    super( GSM, config, parent );
    super.setupProperties({
      "item_font": "",
      "selected_item_font": "",
      "item_color": "",
      "selected_item_color": "",
      "item_padding": "",
      "item_icon_space": "",
      "item_spacing": "",
      "menu_pixmap_style": "",
      "selected_item_pixmap_style": "",
      "scrollbar": false,
      "scrollbar_frame": "",
      "scrollbar_thumb": "",
      "max_items_shown": 0
    });
    super.setupSizeProperties({
      "icon_width": [0,0],
      "icon_height": [0,0],
      "item_height": [0,0]
    });
  }

  draw( ctx, width, height ){
    if(this["menu_pixmap_style"])
      this.drawImageBox( ctx, this["menu_pixmap_style"], 0, 0, width, height );
  }

}

GrubMenuSimulator.registerComponent( "boot_menu", GSM_BootMenu );
