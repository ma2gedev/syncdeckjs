$(function() {
  // Deck initialization
  $.deck('.slide');

  // sync setting
  var sync = true;
  var unsyncMessage = "click to unsync slide";
  var syncMessage = "click to sync slide";
  $("#syncStatus").text(unsyncMessage);
  $("#syncStatus").click(function() {
    sync = !sync;
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
});
