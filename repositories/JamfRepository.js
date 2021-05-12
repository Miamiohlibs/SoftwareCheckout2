const JamfApi = require('../models/JamfApi');
const o2x = require('object-to-xml');
const logger = require('../services/logger');

module.exports = class JamfRepository {
  constructor(conf) {
    this.api = new JamfApi(conf);
  }

  async addUsersToGroup(groupId, users) {
    let xml = this.generateAddOrDeleteXml('add', users);
    let url = this.api.updateGroupRoute + groupId;
    return await this.api.submitPut(url, xml);
  }

  async deleteUsersFromGroup(groupId, users) {
    let xml = generateAddOrDeleteXml('delete', users);
    let url = this.api.updateGroupRoute + groupId;
    return await this.api.submitPut(url, xml);
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
  }

  generateUsersArray(users = []) {
    let usersArr = [];
    users.forEach((username) => {
      usersArr.push({ user: { username: username } });
    });
    return usersArr;
  }
};
