process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('axios');
var o2x = require('object-to-xml');

module.exports = class JamfApi {
  constructor(conf) {
    this.auth = conf.auth;
    this.baseUrl = conf.baseUrl + '/JSSResource';
  }

  submitQuery(route, xml = null) {}

  async addUsersToGroup(groupId, users) {
    let xml = generateAddOrDeleteXml('add', users);
    return await submitQuery(this.updateGroupRoute, xml);
  }

  async deleteUsersFromGroup(groupId, users) {
    let xml = generateAddOrDeleteXml('delete', users);
    return await submitQuery(this.updateGroupRoute, xml);
  }

  generateAddOrDeleteXml(addOrDelete, users) {
    let obj;
    let usersArr = this.generateUsersArray(users);
    if (addOrDelete == 'delete') {
      obj = { user_group: { user_deletions: usersArr } };
    } else {
      obj = { user_group: { user_additions: usersArr } };
    }
    return o2x(obj);
    // return obj;
  }

  generateUsersArray(users = []) {
    let usersArr = [];
    users.forEach((username) => {
      usersArr.push({ user: { username: username } });
    });
    return usersArr;
  }
};
