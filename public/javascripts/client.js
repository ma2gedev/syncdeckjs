$(function() {
  var pointerSync;

  // Deck initialization
  $.deck('.slide');

  // sync setting
  var sync = true;
  var unsyncMessage = "click to unsync slide";
  var syncMessage = "click to sync slide";
  $("#syncStatus").text(unsyncMessage);
  $("#syncStatus").click(function() {
    sync = !sync;
    pointerSync.setSync(sync);
    $(this).text(sync ? unsyncMessage : syncMessage);
  });

  // socket.io settings
  var socket = io.connect();
  socket.on('move', function(data) {
    if (sync) {
      $.deck('go', data);
    }
  });

  // bind page changed event
  $(document).bind('deck.change', function(event, from, to) {
    if (sync) {
      if (from != to) {
        socket.emit('move', to)
      }
    }
  });

  // pointer sync
  pointerSync = new PointerSync({
    socket: socket,
    cursorId: '#pointersync-cursor',
    getContentRectFn: function(isSend) {
      var content = $('.deck-current');
      var scale = 1;
      if (isSend) {
        scale = $('.deck-container').data('scale');
      }
      return { offset: content.offset(),
               width: content.width() * scale,
               height: content.height() * scale };
    }
  });
  $(document).mousemove(function(e) { pointerSync.onMouseMove(e); });

  // keep layout of content for pointer sync
  $('.deck-container').width(1024);
  $('.deck-container').height(768);
  var onResize = function() {
    var width = $(window).width();
    var height = $(window).height();
    var scale = Math.min(width / 1024, height / 768);
    $('.deck-container').css({
      'transform'        : 'scale(' + scale + ')',
      '-webkit-transform': 'scale(' + scale + ')',
      '-moz-transform'   : 'scale(' + scale + ')',
      '-ms-transform'    : 'scale(' + scale + ')',
      '-o-transform'     : 'scale(' + scale + ')'
    });
    $('.deck-container').css({
      'transform-origin'        : '0 0',
      '-webkit-transform-origin': '0 0',
      '-moz-transform-origin'   : '0 0',
      '-ms-transform-origin'    : '0 0',
      '-o-transform-origin'     : '0 0'
    });
    $('.deck-container').data('scale', scale);
  };
  $(window).resize(onResize);
  onResize();
});
