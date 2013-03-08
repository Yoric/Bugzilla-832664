////////////// Setup test

"use strict";

var config = {
  number_of_samples: 10,
  leaves_in_sample: 1000000,
  bytes_in_leaf: 50
};

// Control test size with a url
if (window.location.search.length > 1) {
  (function() {
    var args = window.location.search.substr(1).split("&");
    var i;
    for (i = 0; i < args.length; ++i) {
      var arg = args[i];
      if (arg.startsWith("number=")) {
        config.number_of_samples = parseInt(arg.substr("number=".length));
      } else if (arg.startsWith("leaves=")) {
        config.leaves_in_sample = parseInt(arg.substr("leaves=".length));
      } else if (arg.startsWith("bytes=")) {
        config.bytes_in_leaf = parseInt(arg.substr("bytes=".length));
      }
    }
  })();
}


var eltButton = document.getElementById("start");
var eltMainThread = document.getElementById("serialize_mainthread");
var eltWorkerThread = document.getElementById("serialize_workerthread");
var eltJSON = document.getElementById("serialize_json");

eltJSON.textContent = "Testing " + config.number_of_samples + " runs with an object of " + config.leaves_in_sample + " leaves and " + config.bytes_in_leaf + " bytes per leave";


var stats = function stats(array) {
  // Remove fastest, slowest
  var min = null;
  var max = null;
  array.forEach(function(x) {
    if (min == null || x < min) {
      min = x;
    }
    if (max == null || x > max) {
      max = x;
    }
  });

  if (min == null) {
    return null; // Empty array
  }
  var result = [];
  var sum = 0;
  var removedMin = false;
  var removedMax = false;
  array.forEach(function(x) {
    if (!removedMin && x == min) {
      removedMin = true;
      return;
    }
    if (!removedMax && x == max) {
      removedMax = true;
      return;
    }
    sum += x;
    result.push(x);
  });
  if (result.length == 0) {
    return null;
  }
  var average = sum / result.length;

  var variance = 0;
  result.forEach(function(x) {
    var delta = x - average;
    variance += delta * delta;
  });
  var stddev = Math.sqrt(variance / result.length);

  return {
    average: average,
    samples: result,
    stddev: stddev,
    min: min,
    max: max
  };
};

var onclick = function onclick() {
  eltButton.removeEventListener("click", onclick);

  // Initialize a huge object for serialization
  var hugeObject = {};
  var leaf = "";
  for (var i = 0; i < config.bytes_in_leaf; ++i) {
    leaf += "x";
  }

  for (i = 0; i < config.leaves_in_sample; ++i) {
    hugeObject[":" + i] = leaf;
  }

  var worker = new Worker("./worker.js");

  // Initialize worker
  worker.postMessage({config: config});

  // Duration of each postMessage
  var deltas = [];


  for (i = 0; i < config.number_of_samples; ++i) {
    var scope = (function(i) {
      window.setTimeout(function() {
        console.log("Sending huge object");
        var start = Date.now();
        worker.postMessage({sample: hugeObject});
        var end = Date.now();
        deltas.push(end - start);
        console.log("Huge object sent", end - start, "ms");
        eltMainThread.textContent = "Sent " + ( i + 1 ) + "/" + config.number_of_samples;
      });
    })(i);
  }

  window.setTimeout(function() {
    console.log("Sending end");
    worker.postMessage({end: true});
    var treated = stats(deltas);
    if (!treated) {
      eltMainThread.textContent = "Not enough data";
      return;
    }
    eltMainThread.textContent = "Main-to-worker |postMessage| jank (ms): " +
      "min " + treated.min +
      ", max " + treated.max +
      ", average " + treated.average +
      ", stddev " + treated.stddev;
  });



  var receivedMessages = 0;
  worker.addEventListener("message", function onmessage(e) {
    var data = e.data;
    if (typeof data != "object" || !("json" in data)) {
      // Work is still in progress
      eltWorkerThread.textContent = "Received " + (++receivedMessages) + "/" + config.number_of_samples;
    return;
  }
  worker.removeEventListener("message", onmessage);
  var treated = stats(data.post);
  if (!treated) {
    eltWorkerThread.textContent = "Not enough data";
  } else {
    eltWorkerThread.textContent = "Worker-to-main |postMessage| jank (ms): " +
      "min " + treated.min +
      ", max " + treated.max +
      ", average " + treated.average +
      ", stddev " + treated.stddev;
  }
  treated = stats(data.json);
  if (!treated) {
    eltJSON.textContent = "Not enough data";
  } else {
    eltJSON.textContent = "JSON.stringify (ms): " +
      "min " + treated.min +
      ", max " + treated.max +
      ", average " + treated.average +
      ", stddev " + treated.stddev;
  }
});
};

eltButton.addEventListener("click", onclick);

