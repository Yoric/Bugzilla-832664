"use strict";

var Shared = {
  config: {
    number_of_samples: 100,
    leaves_in_sample: 1000000,
    bytes_in_leaf: 50
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
      var hugeObject = {};
      var leaf = "";
      for (var i = 0; i < Shared.config.bytes_in_leaf; ++i) {
        leaf += "x";
      }

      for (i = 0; i < Shared.config.leaves_in_sample; ++i) {
        hugeObject[":" + i] = leaf;
      }
      return Shared.Sample._hugeObject = hugeObject;
    }
  }
};