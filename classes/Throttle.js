const sleep = require('sleep');

module.exports = class Throttle {
  constructor(reqsPerCycle, secondsPerCycle) {
    this.secondsSincePause = 0;
    this.numberReqsSincePause = 0;
    this.maxReqsPerCycle = reqsPerCycle;
    this.secondsPerCycle = secondsPerCycle;
  }

  exec(myCallback) {
    console.log(typeof myCallback);
    // this.pauseIfNeeded();
    // myCallback();
  }

  pauseIfNeeded() {
    if (this.numberReqsSincePause >= this.maxReqsPerCycle) {
      sleep.sleep(this.secondsPerCycle + 5);
      this.numberReqsSincePause = 0;
    }
    return true;
  }
};
