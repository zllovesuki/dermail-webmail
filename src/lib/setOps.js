'use strict';

// source: https://gist.github.com/jabney/d9d5c13ad7f871ddf03f

function setOps() {
    this.uidList = [];
    this.uid = function() {
        return this;
    }
    this.uidList.push(this.uid);
};

setOps.prototype.pushUid = function(method) {
    this.uidList.push(method);
    this.uid = method;
    return method;
};

setOps.prototype.popUid = function() {
    var prev;
    this.uidList.length > 1 && (prev = this.uidList.pop());
    this.uid = this.uidList[this.uidList.length - 1];
    return prev || null;
};

setOps.prototype.process = function(a, b, evaluator) {
    // Create a histogram of 'a'.
    var self = this,
        hist = Object.create(null),
        out = [],
        ukey, k;
    a.forEach(function(value) {
        ukey = self.uid.call(value);
        if (!hist[ukey]) {
            hist[ukey] = {
                value: value,
                freq: 1
            };
        }
    });
    // Merge 'b' into the histogram.
    b.forEach(function(value) {
        ukey = self.uid.call(value);
        if (hist[ukey]) {
            if (hist[ukey].freq === 1)
                hist[ukey].freq = 3;
        } else {
            hist[ukey] = {
                value: value,
                freq: 2
            };
        }
    });
    // Call the given evaluator.
    if (evaluator) {
        for (k in hist) {
            if (evaluator(hist[k].freq)) out.push(hist[k].value);
        }
        return out;
    } else {
        return hist;
    }
};

setOps.prototype.union = function(a, b) {
    return this.process(a, b, function(freq) {
        return true;
    });
};

setOps.prototype.intersection = function(a, b) {
    return this.process(a, b, function(freq) {
        return freq === 3;
    });
};

setOps.prototype.difference = function(a, b) {
    return this.process(a, b, function(freq) {
        return freq < 3;
    });
};

setOps.prototype.complement = function(a, b) {
    return this.process(a, b, function(freq) {
        return freq === 1;
    });
};

setOps.prototype.equals = function(a, b) {
    var max = 0,
        min = Math.pow(2, 53),
        key,
        hist = this.process(a, b);
    for (var key in hist) {
        max = Math.max(max, hist[key].freq);
        min = Math.min(min, hist[key].freq);
    }
    return min === 3 && max === 3;
};

module.exports = setOps
