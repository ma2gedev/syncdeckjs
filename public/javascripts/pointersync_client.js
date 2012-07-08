// -*- js-indent-level:2 -*-
/*
 * pointersync_client.js
 * Copyright(c) 2012 yoshizow <yoshizow@turtlewalk.org>
 * MIT Licensed
 */

(function($) {

  var PointerSync = function() {
    this.initialize.apply(this, arguments);
  };

  PointerSync.prototype = {
    initialize: function(params) {
      this.socket = params.socket;
      this.cursorId = params.cursorId;
      this.getContentRectFn = params.getContentRectFn;
      this.sync = true;
      this.cursorTimer = null;
      this._registerToSocket();
    },

    _registerToSocket: function() {
      var self = this;
      this.socket.on('cursormove', function(data) {
        self._onReceiveCursorMove(data);
      });
    },

    _onReceiveCursorMove: function(data) {
      if (this.sync) {
        var cursor = $(this.cursorId);
        var contentRect = this.getContentRectFn(false);
        var o = contentRect.offset;
        var x = data.x * contentRect.width  / 1000 + o.left;
        var y = data.y * contentRect.height / 1000 + o.top;
        console.log("data=" + data.x + "," + data.y + ", cr=" + contentRect.width + "x" + contentRect.height + ", x=" + x);
        cursor.css('left', x + 'px');
        cursor.css('top',  y + 'px');
        cursor.show();
        clearTimeout(this.cursorTimer);
        this.cursorTimer = setTimeout(function() {
          cursor.fadeOut(500);
        }, 4500);
      }
    },

    onMouseMove: function(e) {
      if (this.sync) {
        var contentRect = this.getContentRectFn(true);
        var o = contentRect.offset;
        var x = (e.pageX - o.left) * 1000 / contentRect.width;
        var y = (e.pageY - o.top)  * 1000 / contentRect.height;
        this.socket.emit('cursormove', { x: x, y: y });
      }
    },

    setSync: function(b) {
      this.sync = b;
    }
  };

  // export
  window.PointerSync = PointerSync;

})(jQuery);
