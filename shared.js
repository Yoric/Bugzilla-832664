"use strict";

String.random = function(n) {
  // Slow, but we don't really care
  var nums = "0123456789";
  var s = "";
  while (s.length < n) {
    s = s + nums[Math.floor(Math.random() * 10)];
  }
  return s;
};
Array.repeat = function(n, x) {
  if (typeof n == "undefined") {
    throw new Error();
  }
  var buf = [];
  for (var i = 0; i < n; ++ i) {
    buf.push(x);
  }
  return buf;
};

var Shared = {
  config: {
    samples: 100,
    tabs: 300,
    entries: 60,
    children: 500
  },
  stats: function stats(array) {
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
  },

  Sample: {
    _hugeObject: undefined,
    get hugeObject() {
      if (Shared.Sample._hugeObject) {
        return Shared.Sample._hugeObject;
      }
      return Shared.Sample._hugeObject = Shared.Sample.makeHugeObject();
    },
    makeEntriesJSON: function() {
      var entry = {
          "url": String.random(100),
          "title": String.random(50),
          "ID": 1234567890,
          "docshellID": 42,
          "docIdentifier": 0,
          "formdata": {
            "somedata": String.random(30),
            "moredata": String.random(30),
            "yetmoredata": String.random(30),
            "xpath": {},
            "scroll": "0,0"
          }
      };
      return JSON.stringify(Array.repeat(Shared.config.entries, entry));
    },
    makeChildrenJSON: function() {
      var childObject = {
        "url":"about:blank",
        "subframe":true,
        "ID":169300301,
        "docshellID":927,
        "owner_b64":String.random(404),
        "docIdentifier":87,
        "scroll":"0,0",
        "referrer": String.random(100)
      };
      return JSON.stringify(Array.repeat(Shared.config.children, childObject));
    },
    makeTabsJSON: function() {
      var tabObject = {
        "url": String.random(94),
        "title": String.random(51),
        "subframe":true,
        "ID":980,
        "docshellID":922,
        "docIdentifier":85,
        "entries": JSON.parse(Shared.Sample.makeEntriesJSON()),
        "children": JSON.parse(Shared.Sample.makeChildrenJSON()),
        "formdata": {
          "id": {
            "history_state0":"gid=2"
          },
          "xpath":{
        "//xhtml:div[@id='docs-titlebar-container']/xhtml:div[2]/xhtml:div[3]/xhtml:div/xhtml:div/xhtml:div/xhtml:div/xhtml:div/xhtml:div[2]/xhtml:textarea":"Add a comment",
        "//xhtml:div[@id='docs-font-size']/xhtml:div/xhtml:div/xhtml:div/xhtml:input":"10",
        "//xhtml:div[@id='docs-findbar-input']/xhtml:table/xhtml:tbody/xhtml:tr/xhtml:td/xhtml:input":"aug",
        "/xhtml:html/xhtml:body/xhtml:div[4]/xhtml:textarea":"\n"}},
        "scroll":"0,0"
      };
      return JSON.stringify(Array.repeat(Shared.config.tabs, tabObject));
    },
    makeHugeObject: function() {
      var hugeObject = {
        "windows": [
          {
            "tabs": (JSON.parse(Shared.Sample.makeTabsJSON()))
          }
        ],
        "session": {
          "state":"running",
          "lastUpdate":1370331544100,
          "startTime":1369507841441,
          "recentCrashes":1
        },
        "scratchpads":[]
      };
      if (typeof console != "undefined") {
        var stringified = JSON.stringify(hugeObject);
        console.log("Huge object", stringified.length, "bytes");
      }
      return hugeObject;
    }
  }
};