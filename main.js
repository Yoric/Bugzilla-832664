////////////// Setup test

var NUMBER_OF_SAMPLES = 100;
var LEAVES_IN_SAMPLE = 1000000;
var BYTES_IN_LEAVE = 50;

// Control test size with a url
if (window.location.search.length > 1) {
  (function() {
    var args = window.location.search.substr(1).split("&");
    var i;
    for (i = 0; i < args.length; ++i) {
      var arg = args[i];
      if (arg.startsWith("number=")) {
        NUMBER_OF_SAMPLES = parseInt(arg.substr("number=".length));
      } else if (arg.startsWith("leaves=")) {
        LEAVES_IN_SAMPLE = parseInt(arg.substr("leaves=".length));
      } else if (arg.startsWith("bytes=")) {
        BYTES_IN_LEAVE = parseInt(arg.substr("bytes=".length));
      }
    }
  })();
}


var eltMainThread = document.getElementById("mainthread");
var eltWorkerThread = document.getElementById("workerthread");
var eltJSON = document.getElementById("json");

// Initialize a huge object for serialization
var hugeObject = {};
var leaf = "";
for (var i = 0; i < BYTES_IN_LEAVE; ++i) {
  leaf += "x";
}

for (var i = 0; i < LEAVES_IN_SAMPLE; ++i) {
  hugeObject[":" + i] = leaf;
}

var worker = new Worker("./worker.js");

// Initialize worker
worker.postMessage("");

var deltas = [];


for (i = 0; i < NUMBER_OF_SAMPLES; ++i) {
  var scope = (function(i) {
    window.setTimeout(function() {
      console.log("Sending hugeObject");
      var start = Date.now();
      worker.postMessage(hugeObject);
      var end = Date.now();
      deltas.push(end - start);
      console.log("HugeObject sent", end - start);
      eltMainThread.textContent = "Sent " + ( i + 1 ) + "/" + NUMBER_OF_SAMPLES;
    });
  })(i);
}

window.setTimeout(function() {
  console.log("Sending end");
  worker.postMessage("end");
});


var receivedMessages = 0;
worker.addEventListener("message", function onmessage(e) {
  var data = e.data;
  if (!("deltas" in data)) {
    // Ignore message
    eltWorkerThread.textContent = "Received " + (++receivedMessages) + "/" + NUMBER_OF_SAMPLES;
    return;
  }
  eltMainThread.textContent = "Main thread serialization (ms): " + deltas.join(", ");
  eltWorkerThread.textContent = "Worker thread serialization (ms): " + data.deltas.join(", ");
  eltJSON.textContent = "JSON serialization (ms): " + data.serialize;

  console.log("Serialization cost", "(main thread)", deltas);
  console.log("Serialization cost", "(worker thread)", data.deltas);
  console.log("Serialization to JSON cost", "(worker thread)", data.serialize);
});