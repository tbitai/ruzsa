// Based on http://stackoverflow.com/a/34224563/4382643

import $ from 'jquery';

$.fn.textWidth = function(_text, _font){//get width of text with font.  usage: $("div").textWidth();
        let fakeEl = $('<span>').hide().appendTo(document.body).text(_text || this.val() || this.text()).css('font', _font || this.css('font')),
            width = fakeEl.width();
        fakeEl.remove();
        return width;
    };


$.fn.inputAutoresize = function(options){//resizes elements based on content size.  usage: $('input').inputAutoresize({padding:10,minWidth:0,maxWidth:100});
  options = $.extend({padding:10,minWidth:0,maxWidth:10000}, options||{});
  $(this).on('input', function() {
    $(this).css('width', Math.min(options.maxWidth,Math.max(options.minWidth,$(this).textWidth() + options.padding)));
  });
  return this;
};
