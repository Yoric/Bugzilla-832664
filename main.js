////////////// Setup test

var gTests = [];

// Control test size with a url
if (window.location.search.length > 1) {
  (function() {
    var args = window.location.search.substr(1).split("&");
    var i;
    for (i = 0; i < args.length; ++i) {
      var arg = args[i];
      if (arg.startsWith("test=")) {
        gTests = [arg.substr("test=".length)];
      } else if (arg.startsWith("repeat=")) {
        Shared.config.samples = parseInt(arg.substr("repeat=".length));
      } else if (arg.startsWith("tabs=")) {
        Shared.config.tabs = parseInt(arg.substr("tabs=".length));
      } else if (arg.startsWith("entries=")) {
        Shared.config.entries = parseInt(arg.substr("entries=".length));
      } else if (arg.startsWith("children=")) {
        Shared.config.children = parseInt(arg.substr("children=".length));
      }
    }
  })();
}


var eltButton = document.getElementById("start");
var eltMainThread = document.getElementById("serialize_mainthread");
var eltWorkerThread = document.getElementById("serialize_workerthread");
var eltJSON = document.getElementById("serialize_json");

window.setTimeout(function() {
  eltJSON.textContent = "Repeat " + Shared.config.samples + " runs with a session of " + Shared.config.tabs + " tabs, " + Shared.config.children + " iframes per tab  and " + Shared.config.entries + " history entries per tab/iframe";
}, 500);

var Tests = {
  // Test the duration of sending an object
  sendObject: function sendObject(worker, object) {
    var deltas = [];
    for (var i = 0; i < Shared.config.samples; ++i) {
      var scope = (function(i) {
        window.setTimeout(function() {
          console.log("Sending huge object");
          var start = Date.now();
          worker.postMessage({sample: object});
          var end = Date.now();
          deltas.push(end - start);
          console.log("Huge object sent", end - start, "ms");
          eltMainThread.textContent = "Sent " + ( i + 1 ) + "/" + Shared.config.samples;
        });
      })(i);
    }
    window.setTimeout(function() {
      console.log("Sending end");
      worker.postMessage({end: true});
      var treated = Shared.stats(deltas);
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
  },

  receiveObject: function receiveObject(worker) {
    worker.postMessage({start: "receiveObject"});
    var receivedMessages = 0;
    worker.addEventListener("message", function onmessage(e) {
      var data = e.data;
      if (typeof data != "object" || !("json" in data)) {
        // Work is still in progress
          eltWorkerThread.textContent = "Received " +
            (++receivedMessages) + "/" +
          (Shared.config.samples + 1);
        console.log("Received message", receivedMessages, data);
        return;
      }
      worker.removeEventListener("message", onmessage);
      var treated = Shared.stats(data.durationPost);
      if (!treated) {
        eltWorkerThread.textContent = "Not enough data";
      } else {
        eltWorkerThread.textContent = "Worker-to-main |postMessage| jank (ms): " +
          "min " + treated.min +
          ", max " + treated.max +
          ", average " + treated.average +
          ", stddev " + treated.stddev;
      }
    });
  }
}

var onclick = function onclick() {
  eltButton.removeEventListener("click", onclick);

  console.log("Running tests", JSON.stringify(gTests));

  // Initialize a huge object for serialization
  var worker = new Worker("./worker.js");

  // Initialize worker
  worker.postMessage({config: Shared.config, tests: gTests});

  for (var test of gTests) {
    console.log("Starting test", test);
    Tests[test](worker, Shared.Sample.hugeObject);
    console.log("Test", test, "complete");
  };
  console.log("All tests complete");
};

eltButton.addEventListener("click", onclick);

