const JamfApi = require('../models/JamfApi');
const o2x = require('object-to-xml');
const logger = require('../services/logger');
const { uniqueId } = require('lodash');
const xml2json = require('xml2json');

module.exports = class JamfRepository {
  constructor(conf) {
    this.api = new JamfApi(conf);
    this.emailSuffix = conf.emailSuffix;
    this.userGroupName = conf.userGroupName;
  }

  async getGroupMembers(groupId) {
    try {
      let url = this.api.userGroupRoute + groupId;
      let res = await this.api.submitGet(url);
      let usernames = res.user_group.users.map((user) => user.username);
      return this.addEmailSuffixes(usernames);
    } catch (err) {
      logger.error('failed JamfRepo.getGroupMembers', { error: err });
    }
  }

  async addUsersToGroup(groupId, users) {
    let usernames = this.removeEmailSuffixes(users);
    let xml = this.generateAddOrDeleteXml('add', usernames);
    let url = this.api.userGroupRoute + groupId;
    return await this.api.submitPut(url, xml);
  }

  async deleteUsersFromGroup(groupId, users) {
    let usernames = this.removeEmailSuffixes(users);
    let xml = this.generateAddOrDeleteXml('delete', usernames);
    let url = this.api.userGroupRoute + groupId;
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

  generateCreateUserXML(uniqueId, fullName = 'Unknown') {
    let obj = {
      user: {
        name: uniqueId,
        full_name: fullName,
        email: this.addEmailSuffix(uniqueId),
        email_address: this.addEmailSuffix(uniqueId),
        position: this.userGroupName,
      },
    };
    return o2x(obj);
  }

  async createUser(uniqueId, fullName) {
    let xml = this.generateCreateUserXML(uniqueId, fullName);
    let resXml = await this.api.submitPost(this.api.newUserRoute, xml);
    let res = JSON.parse(xml2json.toJson(resXml));
    if (res.hasOwnProperty('user')) {
      return { success: true, user: res.user };
    } else {
      return { success: false, res: res };
    }
  }

  addEmailSuffix(user) {
    return user + this.emailSuffix;
  }

  removeEmailSuffix(user) {
    return user.replace(this.emailSuffix, '');
  }

  addEmailSuffixes(users) {
    return users.map((u) => this.addEmailSuffix(u));
  }

  removeEmailSuffixes(users) {
    return users.map((u) => this.removeEmailSuffix(u));
  }
};
