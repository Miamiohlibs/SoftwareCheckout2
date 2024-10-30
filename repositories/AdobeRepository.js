const AdobeApi = require('../models/AdobeApi');
const Throttle = require('../helpers/Throttle');
const { asyncForEach } = require('../helpers/utils');
const _ = require('lodash');
const logger = require('../services/logger');

module.exports = class AdobeUserMgmtService {
  constructor(conf) {
    this.api = new AdobeApi(conf);
    this.baseUrl = 'https://usermanagement.adobe.io/v2/usermanagement/';
    this.credentials = conf.credentials;
    this.actionUrl = this.baseUrl + 'action' + '/' + conf.credentials.orgId;
    this.queryConf = {};
    let userReqsPerCycle = 25;
    let secondsPerUserCycle = 60;
    this.userThrottle = new Throttle(userReqsPerCycle, secondsPerUserCycle);
    let actionsReqPerCycle = 10;
    let secondsPerActionCycle = 60;
    this.maxActionsPerReq = 10;
    this.actionThrottle = new Throttle(
      actionsReqPerCycle,
      secondsPerActionCycle
    );
  }

  clearQueryConf() {
    this.queryConf = {};
  }

  async getPaginatedResults(container, group) {
    logger.debug('AdobeRepo: starting getPaginatedResults...');
    let allResults = [];
    let lastPage = false;
    while (lastPage == false) {
      await this.userThrottle.pauseIfNeeded();
      let res = await this.api.getQueryResults(this.queryConf);
      this.userThrottle.increment();
      try {
        allResults = allResults.concat(res[container]);
      } catch (err) {
        logger.error(
          `AdobeRepo: Error in getPaginatedResults for ${container} in group ${group}`,
          {
            content: err,
          }
        );
        return [];
      }
      lastPage = res.lastPage;
      if (!lastPage) {
        this.queryConf.url = this.getNextUrl(this.queryConf.url);
      }
    }
    return allResults;
  }

  getNextUrl(url) {
    let [first, page, last] = url.split(/\/(\d+)\//);
    page = parseInt(page);
    page++;
    return first + '/' + page + '/' + last;
  }

  async getGroupMembers(group) {
    logger.debug('AdobeRepo: starting getGroupMembers())');
    this.clearQueryConf();
    this.queryConf.url =
      this.baseUrl + 'users' + '/' + this.credentials.orgId + '/0/' + group;
    this.queryConf.method = 'GET';
    // console.log('queryConf: ' + JSON.stringify(this.queryConf));
    logger.debug('AdobeRepo: getGroupMembers query conf', {
      content: this.queryConf,
    });
    let res = await this.getPaginatedResults('users', group);
    return res;
  }

  getEmailsFromGroupMembers(data) {
    if (!data || data.length == 0) return [];
    return data.map((i) => i.email);
  }

  async addGroupMembers(emails, listName, testOnly = null) {
    return await this.alterGroupMembers('add', emails, listName, testOnly);
  }

  async removeGroupMembers(emails, listName, testOnly = null) {
    return await this.alterGroupMembers('remove', emails, listName, testOnly);
  }

  async alterGroupMembers(addOrRemove, emails, listName, testOnly = null) {
    let reqBody = this.prepBulkGroupUsers(addOrRemove, emails, listName);
    let reqBodyChunks = _.chunk(reqBody, this.maxActionsPerReq);
    this.setActionUrl(testOnly);
    await this.submitActionReqs(reqBodyChunks);
    return {
      status: this.actionStatus(),
      message: this.actionResultsSummary,
    };
  }

  setActionUrl(testOnly = null) {
    this.clearQueryConf();
    this.queryConf.url = this.actionUrl;
    this.queryConf.method = 'post';
    if (testOnly == 'test') {
      this.queryConf.url += '?testOnly=true';
    }
  }

  actionStatus() {
    if (!this.actionResultsSummary) return 'error';
    if (this.actionResultsSummary.notCompleted == 0) return 'success';
    else return 'error';
  }

  async submitActionReqs(reqBodyChunks) {
    try {
      this.actionResultsSummary = {};

      await asyncForEach(reqBodyChunks, async (data) => {
        this.queryConf.data = data;
        await this.actionThrottle.pauseIfNeeded();
        this.queryConf.timeout = 10000; // 10 seconds
        logger.debug('AdobeRepo: submitting action with queryConf', {
          content: this.queryConf,
        });
        let res = await this.api.getQueryResults(this.queryConf);
        this.actionThrottle.increment();
        this.concatActionResults(res);
      });
      logger.debug('action summary results', {
        content: this.actionResultsSummary,
      });
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  concatActionResults(data) {
    logger.debug('concatActionResults', { content: data });
    for (const [key, value] of Object.entries(data)) {
      if (!this.actionResultsSummary.hasOwnProperty(key)) {
        this.actionResultsSummary[key] = value;
      } else if (typeof value == 'number') {
        this.actionResultsSummary[key] += value;
      } else if (Array.isArray(value)) {
        this.actionResultsSummary[key].concat;
      }
    }
  }

  prepBulkGroupUsers(addOrRemove, emails, listName) {
    let i = 1;
    let jsonBody = [];
    emails.forEach((email) => {
      jsonBody.push(
        this.createActionReqBody(addOrRemove, email, [listName], i)
      );
      i++;
    });
    return jsonBody;
  }

  createActionReqBody(addOrRemove, user, groups, n = 1) {
    let doObj = [
      {
        [addOrRemove]: {
          group: groups,
        },
      },
    ];
    return { user: user, requestID: 'action_' + n, do: doObj };
  }
};
