const { sleep } = require('./utils');
const logger = require('../services/logger');

module.exports = class Throttle {
  constructor(reqsPerCycle, secondsPerCycle) {
    this.secondsSincePause = 0;
    this.numberReqsSincePause = 0;
    this.maxReqsPerCycle = reqsPerCycle;
    this.secondsPerCycle = secondsPerCycle;
  }

  async pauseIfNeeded() {
    if (this.numberReqsSincePause >= this.maxReqsPerCycle) {
      logger.info('pausing throttle');
      await sleep(this.secondsPerCycle + 5);
      this.numberReqsSincePause = 0;
    }
    return true;
  }

  increment() {
    this.numberReqsSincePause++;
  }
};
