var object = {};

for (var i = 0; i < 1000000; ++i) {
  object[":" + i] = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";
}

var worker = new Worker("./worker.js");

// Initialize worker
worker.postMessage("");

var deltas = [];

for (i = 0; i < 1; ++i) {
  window.setTimeout(function() {
    console.log("Sending object");
    var start = Date.now();
    worker.postMessage(object);
    var end = Date.now();
    deltas.push(end - start);
    console.log("Object sent", end - start);
  });
}

window.setTimeout(function() {
  console.log("Sending end");
  worker.postMessage("end");
});


worker.addEventListener("message", function onmessage(e) {
  var data = e.data;
  if (!Array.isArray(data)) {
    // Ignore message
    return;
  }
  var eltMainThread = document.getElementById("mainthread");
  eltMainThread.textContent = "Main thread serialization (ms): " + JSON.serialize(deltas);
  var eltWorkerThread = document.getElementById("workerthread");
  eltWorkerThread.textContent = "Worker thread serialization (ms): " + JSON.serialize(deltas);

  console.log("Serialization cost", "(main thread)", deltas);
  console.log("Serialization cost", "(worker thread)", data);
});