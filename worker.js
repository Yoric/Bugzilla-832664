var deltas = [];
self.addEventListener("message", function onmessage(e) {
  var data = e.data;
  if (data == "") {
    return;
  }
  if (data == "end") {
    self.postMessage(deltas);
    return;
  }
  var start = Date.now();
  self.postMessage(data);// Post message back to sender
  var end = Date.now();
  deltas.push(end - start);
});