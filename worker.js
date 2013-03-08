var hugeObject = null;
var deltaPostMessage = [];
var deltaJSON = [];
var config;
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
    config = data.config;
    var hugeObject = {};
    var leaf = "";
    for (var i = 0; i < config.bytes_in_leaf; ++i) {
      leaf += "x";
    }

    for (i = 0; i < config.leaves_in_sample; ++i) {
      hugeObject[":" + i] = leaf;
    }

    return;
  }

  if (typeof data == "object" && "sample" in data) {
    // Perform measure
    // Measure the duration of JSON serialization, for comparison
    deltaJSON.push(measureDuration(function() {
      JSON.stringify(hugeObject);
    }));
    // Measure how long it takes to postMessage object to main thread
    deltaPostMessage.push(measureDuration(function() {
      self.postMessage(hugeObject);
    }));
    return;
  }

  if (typeof data == "object" && "end" in data) {
    self.postMessage({post: deltaPostMessage, json: deltaJSON});
    return;
  }
});