importScripts("shared.js");

var deltaJSON = [];

var measureDuration = function measureDuration(f) {
  var start = Date.now();
  f();
  var end = Date.now();
  return end - start;
};

self.addEventListener("message", function onmessage(e) {
  var data = e.data;

  if (typeof data == "object" && "config" in data) {
    // Initialize worker
    Shared.config = data.config;
    dump("Generated hugeObject" + JSON.stringify(Shared.Sample.hugeObject));
    return;
  }

  if (data.start == "receiveObject") {
    // Measure how long it takes to postMessage object to main thread
    var deltaPostMessage = [];
    for (var i = 0; i < Shared.config.number_of_samples; ++i) {
      deltaPostMessage.push(measureDuration(function() {
        var object = Shared.Sample.makeHugeObject();
        object.id = i;
        self.postMessage(object);
      }));
    }
    self.postMessage({durationPost: deltaPostMessage});
    return;
  }

});