const { sleep } = require('../helpers/utils');

module.exports = class Throttle {
  constructor(reqsPerCycle, secondsPerCycle) {
    this.secondsSincePause = 0;
    this.numberReqsSincePause = 0;
    this.maxReqsPerCycle = reqsPerCycle;
    this.secondsPerCycle = secondsPerCycle;
  }

  async pauseIfNeeded() {
    if (this.numberReqsSincePause >= this.maxReqsPerCycle) {
      await sleep(this.secondsPerCycle + 5);
      this.numberReqsSincePause = 0;
    }
    return true;
  }

  increment() {
    this.numberReqsSincePause++;
  }
};
