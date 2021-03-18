const Query = require('./Query');
const jwtAuth = require('@adobe/jwt-auth');
const path = require('path');
const fs = require('fs');

// uncomment this line to suppress debug messages
console.debug = () => {};

module.exports = class AdobeUserMgmtApi {
  constructor(conf) {
    this.credentials = conf.credentials;
    this.queryConf = conf.queryConf;
    this.credentials.privateKey = fs.readFileSync(
      path.join(__dirname, conf.certs.privateKeyFile),
      'utf8'
    );
  }

  async getToken() {
    let tokenResponse = await jwtAuth(this.credentials);
    this.accessToken = tokenResponse.access_token;
    return tokenResponse.access_token;
  }

  // start with a basic set of options, add or overwrite with new options
  querySetup(baseOpts, opts = null) {
    this.currOpts = JSON.parse(
      JSON.stringify(this.queryConf[baseOpts].options)
    ); //clone values, don't pass by reference

    let authHeaders = {
      Authorization: 'Bearer ' + this.accessToken,
      'x-api-key': this.credentials.clientId,
    };

    if (opts != null) {
      if (opts.hasOwnProperty('headers')) {
        var tmpHeaders = opts.headers;
        delete opts.headers;
      }
      // add additional opts from argument
      this.currOpts = Object.assign(this.currOpts, opts);
    }

    // add auth headers
    this.currOpts.headers = Object.assign(this.currOpts.headers, authHeaders);
    // add other specified headers
    if (typeof tmpHeaders !== 'undefined') {
      this.currOpts.headers = Object.assign(this.currOpts.headers, tmpHeaders);
    }
  }

  getActionPath(action, argument = null, page = 0) {
    //validate input
    if (typeof action != 'string') {
      throw new Error(
        'action must be a string; typeof action = ' + typeof action
      );
    }
    if (page == null) {
      page = 0;
    } else if (isNaN(page)) {
      throw new Error(
        'page must be a number or numeric string; typeof page = ' + typeof page
      );
      // console.log('Page: ', page, parseInt(page))
    }
    if (action == 'action') {
      page = '';
    }

    // build query path
    let path =
      this.queryConf.generic.options.pathStem +
      action +
      '/' +
      this.credentials.orgId +
      '/' +
      page;
    if (argument != null && argument != undefined) {
      path += '/' + argument + '?';
    } else {
      path += '?';
    }
    return path;
  }

  async executeCurrQuery(body = null) {
    let obj = {};
    obj.options = this.currOpts;
    // console.log(obj)
    let query = new Query(obj);
    if (body !== null) {
      query.setData(body);
    }
    console.debug(query);
    console.debug(query.queryConf.options.headers);
    return await query.execute();
  }

  async callGetGroups() {
    let path = this.getActionPath('groups');
    this.querySetup('generic', { method: 'GET', path: path });
    return this.executeCurrQuery();
  }

  async callGroupUsers(groupName) {
    groupName = encodeURI(groupName);
    let path = this.getActionPath('users', groupName);
    this.querySetup('generic', { method: 'GET', path: path });
    return this.executeCurrQuery();
  }

  async callSubmitJson(body, testOnly = false) {
    let path = await this.getActionPath('action');
    if (testOnly) {
      path += 'testOnly=true';
    }
    this.querySetup('generic', {
      method: 'POST',
      path: path,
      headers: { 'Content-Type': 'application/json' },
    });
    return this.executeCurrQuery(body);
  }

  getAdobeLists(listConfObj) {
    // looks at the listConfObj
    // returns results with {'provider':'Adobe'} and has a defined 'adobeGroupName' attribute
    const allAdobeLists = listConfObj.filter(
      (item) => item.provider == 'Adobe'
    );
    const goodGroups = allAdobeLists.filter((item) =>
      item.hasOwnProperty('adobeGroupName')
    );
    let errors = [];
    allAdobeLists.map((item) => {
      if (!item.hasOwnProperty('adobeGroupName')) {
        errors.push(
          'ERROR: This Adobe group is skipped because it lacks an adobeGroupName property:',
          item
        );
      }
    });
    let returnObj = { groups: goodGroups };
    if (errors.length > 0) {
      returnObj.errors = errors;
    }
    return returnObj;
  }
  getCurrentUsernames(obj) {
    console.debug('input to getCurrentUsername:', obj);
    let users = obj.users;
    return (
      users
        // with status == active
        .filter((item) => item.status == 'active')
        // just return an array of email
        .map((item) => {
          let email = item.email;
          return email;
        })
    );
  }

  filterBookingsToAdd(libCalList, adobeList) {
    // return bookings not currently represented in Adobe User Management
    return libCalList.filter((user) => !adobeList.includes(user.email));
  }

  filterUsersToRevoke(libCalEmails, adobeEmails) {
    return adobeEmails.filter((email) => !libCalEmails.includes(email));
  }

  createAddJsonBody(user, country, firstName, lastName, groups, n = 1) {
    let doObj = [
      {
        //      'createFederatedID': {
        //        email: user,
        //        country: country,
        //        firstname: firstName,
        //        lastname: lastName,
        //        option: 'ignoreIfAlreadyExists'
        //      },
        add: {
          group: groups,
        },
      },
    ];
    return { user: user, requestID: 'action_' + n, do: doObj };
  }

  prepBulkAddFromLibCal2Adobe(bookings, listName) {
    let i = 1;
    let jsonBody = [];
    bookings.forEach((item) => {
      jsonBody.push(
        this.createAddJsonBody(
          item.email,
          'US',
          item.firstName,
          item.lastName,
          [listName],
          i
        )
      );
      i++;
    });
    return jsonBody;
  }

  createRevokeJsonBody(user, groups, n = 1000) {
    let doObj = [
      {
        remove: {
          group: groups,
        },
      },
    ];
    return { user: user, requestID: 'revoke_' + n, do: doObj };
  }

  prepBulkRevokeFromAdobe(userList, listName) {
    let i = 1000;
    let jsonBody = [];
    userList.forEach((item) => {
      jsonBody.push(this.createRevokeJsonBody(item, [listName], i));
      i++;
    });
    return jsonBody;
  }
};
