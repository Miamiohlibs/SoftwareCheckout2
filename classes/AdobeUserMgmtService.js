const debug = require('debug')('AdobeService');
const AdobeApi = require('../classes/AdobeUserMgmtApi');
const Throttle = require('../classes/Throttle');
const Utils = require('../classes/Utils');
const util = new Utils();

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
    this.actionThrottle = new Throttle(
      actionsReqPerCycle,
      secondsPerActionCycle
    );
  }

  clearQueryConf() {
    this.queryConf = {};
  }

  async getPaginatedResults(container) {
    debug('starting getPaginatedResults...');
    let allResults = [];
    let lastPage = false;
    while (lastPage == false) {
      await this.userThrottle.pauseIfNeeded();
      let res = await this.api.getQueryResults(this.queryConf);
      this.userThrottle.increment();
      allResults = allResults.concat(res[container]);
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
    debug('starting getGroupMembers())');
    this.clearQueryConf();
    this.queryConf.url =
      this.baseUrl + 'users' + '/' + this.credentials.orgId + '/0/' + group;
    this.queryConf.method = 'GET';
    debug('getGroupMembers query conf: ' + this.queryConf);
    let res = await this.getPaginatedResults('users');
    return res;
  }

  getEmailsFromGroupMembers(data) {
    return data.map((i) => i.email);
  }

  async addMembersToGroup(emailsToAdd, listName, testOnly = null) {
    let reqBody = this.prepBulkAddUsers2AdobeGroup(emailsToAdd, listName);
    let reqBodyChunks = util.chunkArray(reqBody, this.maxActionsPerReq);

    this.clearQueryConf();
    this.queryConf.url = this.actionUrl;
    this.queryConf.method = 'post';
    if (testOnly == 'test') {
      this.queryConf.url += '?testOnly=true';
    }

    await this.submitActionReqs(reqBodyChunks);
    return this.actionResultsSummary;
  }

  async submitActionReqs(reqBodyChunks) {
    try {
      this.actionResultsSummary = {};
      reqBodyChunks.forEach(async (data) => {
        this.queryConf.data = data;
        this.actionThrottle.pauseIfNeeded();
        debug('submitting action with queryConf: ' + this.queryConf);
        let res = await this.api.getQueryResults(this.queryConf);
        this.actionThrottle.increment();

        if (res) {
          this.handleActionResults(res);
        }
        this.concatActionResults(res);
      });
    } catch (err) {
      console.log(err);
      return false;
    }
    return this.actionResultsSummary;
  }

  concatActionResults(data) {
    for (const [key, value] of Object.entries(data)) {
      if (typeof value == 'number') {
        if (!this.actionResultsSummary.hasOwnProperty(key)) {
          this.actionResultsSummary[key] = value;
        } else this.actionResultsSummary[key] += value;
      }
    }
  }

  prepBulkAddUsers2AdobeGroup(emailsToAdd, listName) {
    let i = 1;
    let jsonBody = [];
    emailsToAdd.forEach((email) => {
      jsonBody.push(this.createAddJsonBody(email, [listName], i));
      i++;
    });
    return jsonBody;
  }

  createAddJsonBody(user, groups, n = 1) {
    let doObj = [
      {
        add: {
          group: groups,
        },
      },
    ];
    return { user: user, requestID: 'action_' + n, do: doObj };
  }

  handleActionResults(res) {
    if (res.notCompleted != 0 || res.hasOwnProperty('errors')) {
      console.log('Partially failed Adobe actions:');
      console.log(res);
      console.log('Error generated for request:', this.queryConf.data);
    }
  }
};
