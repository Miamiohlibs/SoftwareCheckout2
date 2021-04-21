// const Query = require('./Query');
const axios = require('axios');
const jwtAuth = require('@adobe/jwt-auth');
const path = require('path');
const fs = require('fs');
const sleep = require('sleep');
const debug = require('debug')('AdobeUserMgmtApi');
// const { queryConf } = require('../config/adobe');

module.exports = class AdobeUserMgmtApi {
  constructor(conf) {
    this.baseUrl = 'https://usermanagement.adobe.io/v2/usermanagement/';
    this.credentials = conf.credentials;
    this.addPrivateKeyToCredentials(conf);
    this.actionUrl = this.baseUrl + 'action' + '/' + this.credentials.orgId;
    //throttle settings:
    this.numberReqsSincePause = 0;
    this.maxReqsPerCycle = 25;
    this.secondsPerCycle = 60;
    this.queryConf = {};
  }

  addPrivateKeyToCredentials(conf) {
    this.credentials.privateKey = fs.readFileSync(
      path.join(__dirname, conf.certs.privateKeyFile),
      'utf8'
    );
  }

  async getToken() {
    try {
      let tokenResponse = await jwtAuth(this.credentials);
      this.accessToken = tokenResponse.access_token;
    } catch (err) {
      console.log('Failed to get Adobe token in:', __filename);
      console.log(err);
    }
  }

  clearQueryConf() {
    this.queryConf = {};
  }

  setQueryConf(key, value) {
    this.queryConf[key] = value;
  }

  async getQueryResults(method, url, addedParams = {}) {
    debug('starting getQueryResults for ', url);
    this.queryConf.headers = this.getAuthHeaders();
    // let queryConf = {
    //   method: method,
    //   url: url,
    //   headers: this.getAuthHeaders(),
    // };
    // queryConf = this.addQueryParams(queryConf, addedParams);

    /* 
    NOTE: when this gets a non-200 result back, it just 
    spews the response to the console. Let's do better... 
    */
    try {
      let res = await axios(this.queryConf);
      return res.data;
    } catch (err) {
      console.log(('Failed Adobe query:', err));
    }
  }

  // addQueryParams(queryConf, addedParams) {
  //   let allowedParams = ['testOnly', 'data'];
  //   allowedParams.forEach((p) => {
  //     if (addedParams.hasOwnProperty(p)) {
  //       queryConf[p] = addedParams[p];
  //     }
  //   });
  //   return queryConf;
  // }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'x-api-key': `${this.credentials.clientId}`,
    };
  }

  async getPaginatedResults(container) {
    debug('starting getPaginatedResults...');
    let allResults = [];
    let lastPage = false;
    while (lastPage == false) {
      await this.throttlePauseIfNeeded();
      let res = await this.getQueryResults();
      this.numberReqsSincePause++;
      allResults = allResults.concat(res[container]);
      lastPage = res.lastPage;
      if (!lastPage) {
        this.queryConf.url = this.getNextUrl(this.queryConf.url);
      }
    }
    return allResults;
  }

  throttlePauseIfNeeded() {
    if (this.numberReqsSincePause >= this.maxReqsPerCycle) {
      sleep.sleep(this.secondsPerCycle + 5);
      this.numberReqsSincePause = 0;
    }
    return true;
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
    let res = await this.getPaginatedResults('users');
    return res;
  }

  getEmailsFromGroupMembers(data) {
    return data.map((i) => i.email);
  }

  async addMembersToGroup(emailsToAdd, listName, testOnly = null) {
    try {
      let reqBody = this.prepBulkAddUsers2AdobeGroup(emailsToAdd, listName);
      this.queryConf.url = this.actionUrl;
      this.queryConf.method = 'post';
      this.queryConf.data = reqBody;
      if (testOnly == 'test') {
        this.queryConf.url += '?testOnly=true';
      }
      return await this.getQueryResults();
    } catch (err) {
      console.log(err);
      return false;
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

  //GET /v2/usermanagement/users/{orgId}/{page}/{groupName}

  // // start with a basic set of options, add or overwrite with new options
  // querySetup(baseOpts, opts = null) {
  //   this.currOpts = JSON.parse(
  //     JSON.stringify(this.queryConf[baseOpts].options)
  //   ); //clone values, don't pass by reference

  //   let authHeaders = {
  //     Authorization: 'Bearer ' + this.accessToken,
  //     'x-api-key': this.credentials.clientId,
  //   };

  //   if (opts != null) {
  //     if (opts.hasOwnProperty('headers')) {
  //       var tmpHeaders = opts.headers;
  //       delete opts.headers;
  //     }
  //     // add additional opts from argument
  //     this.currOpts = Object.assign(this.currOpts, opts);
  //   }

  //   // add auth headers
  //   this.currOpts.headers = Object.assign(this.currOpts.headers, authHeaders);
  //   // add other specified headers
  //   if (typeof tmpHeaders !== 'undefined') {
  //     this.currOpts.headers = Object.assign(this.currOpts.headers, tmpHeaders);
  //   }
  // }

  // getActionPath(action, argument = null, page = 0) {
  //   //validate input
  //   if (typeof action != 'string') {
  //     throw new Error(
  //       'action must be a string; typeof action = ' + typeof action
  //     );
  //   }
  //   if (page == null) {
  //     page = 0;
  //   } else if (isNaN(page)) {
  //     throw new Error(
  //       'page must be a number or numeric string; typeof page = ' + typeof page
  //     );
  //     // console.log('Page: ', page, parseInt(page))
  //   }
  //   if (action == 'action') {
  //     page = '';
  //   }

  //   // build query path
  //   let path =
  //     this.queryConf.generic.options.pathStem +
  //     action +
  //     '/' +
  //     this.credentials.orgId +
  //     '/' +
  //     page;
  //   if (argument != null && argument != undefined) {
  //     path += '/' + argument + '?';
  //   } else {
  //     path += '?';
  //   }
  //   return path;
  // }

  // async executeCurrQuery(body = null) {
  //   let obj = {};
  //   obj.options = this.currOpts;
  //   // console.log(obj)
  //   let query = new Query(obj);
  //   if (body !== null) {
  //     query.setData(body);
  //   }
  //   console.debug(query);
  //   console.debug(query.queryConf.options.headers);
  //   return await query.execute();
  // }

  // async callGetGroups() {
  //   let path = this.getActionPath('groups');
  //   this.querySetup('generic', { method: 'GET', path: path });
  //   return this.executeCurrQuery();
  // }

  // async callGroupUsers(groupName) {
  //   groupName = encodeURI(groupName);
  //   let path = this.getActionPath('users', groupName);
  //   this.querySetup('generic', { method: 'GET', path: path });
  //   return this.executeCurrQuery();
  // }

  // async callSubmitJson(body, testOnly = false) {
  //   let path = await this.getActionPath('action');
  //   if (testOnly) {
  //     path += 'testOnly=true';
  //   }
  //   this.querySetup('generic', {
  //     method: 'POST',
  //     path: path,
  //     headers: { 'Content-Type': 'application/json' },
  //   });
  //   return this.executeCurrQuery(body);
  // }

  // getAdobeLists(listConfObj) {
  //   // looks at the listConfObj
  //   // returns results with {'provider':'Adobe'} and has a defined 'adobeGroupName' attribute
  //   const allAdobeLists = listConfObj.filter(
  //     (item) => item.provider == 'Adobe'
  //   );
  //   const goodGroups = allAdobeLists.filter((item) =>
  //     item.hasOwnProperty('adobeGroupName')
  //   );
  //   let errors = [];
  //   allAdobeLists.map((item) => {
  //     if (!item.hasOwnProperty('adobeGroupName')) {
  //       errors.push(
  //         'ERROR: This Adobe group is skipped because it lacks an adobeGroupName property:',
  //         item
  //       );
  //     }
  //   });
  //   let returnObj = { groups: goodGroups };
  //   if (errors.length > 0) {
  //     returnObj.errors = errors;
  //   }
  //   return returnObj;
  // }
  // getCurrentUsernames(obj) {
  //   console.debug('input to getCurrentUsername:', obj);
  //   let users = obj.users;
  //   return (
  //     users
  //       // with status == active
  //       .filter((item) => item.status == 'active')
  //       // just return an array of email
  //       .map((item) => {
  //         let email = item.email;
  //         return email;
  //       })
  //   );
  // }

  // filterBookingsToAdd(libCalList, adobeList) {
  //   // return bookings not currently represented in Adobe User Management
  //   return libCalList.filter((user) => !adobeList.includes(user.email));
  // }

  // filterUsersToRevoke(libCalEmails, adobeEmails) {
  //   return adobeEmails.filter((email) => !libCalEmails.includes(email));
  // }

  // createRevokeJsonBody(user, groups, n = 1000) {
  //   let doObj = [
  //     {
  //       remove: {
  //         group: groups,
  //       },
  //     },
  //   ];
  //   return { user: user, requestID: 'revoke_' + n, do: doObj };
  // }

  // prepBulkRevokeFromAdobe(userList, listName) {
  //   let i = 1000;
  //   let jsonBody = [];
  //   userList.forEach((item) => {
  //     jsonBody.push(this.createRevokeJsonBody(item, [listName], i));
  //     i++;
  //   });
  //   return jsonBody;
  // }
};
