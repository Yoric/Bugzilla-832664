var object = null;
var deltas = [];

var measureDuration = function measureDuration(f) {
  var start = Date.now();
  f();
  var end = Date.now();
  return end - start;
};

self.addEventListener("message", function onmessage(e) {
  var data = e.data;
  if (data == "") {
    return;
  }
  if (data == "end") {
    // Measure the duration of JSON serialization, for comparison
    var serialize = measureDuration(function() {
      JSON.stringify(object);
    });
    self.postMessage({deltas: deltas, serialize: serialize});
    return;
  }
  object = data;
  deltas.push(measureDuration(function() {
    self.postMessage(data);// Post message back to sender
  }));
});