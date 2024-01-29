const JamfApi = require('../models/JamfApi');
const o2x = require('object-to-xml');
const logger = require('../services/logger');
const { uniqueId } = require('lodash');
const Throttle = require('../helpers/Throttle');
const xmlParser = require('fast-xml-parser');

module.exports = class JamfRepository {
  constructor(conf) {
    this.api = new JamfApi(conf);
    this.emailSuffix = conf.emailSuffix;
    this.userGroupName = conf.userGroupName;
    let userReqsPerCycle = 6;
    let secondsPerUserCycle = 3;
    this.throttle = new Throttle(userReqsPerCycle, secondsPerUserCycle);
  }

  /* User Create/Delete Methods */

  async createUserIfNeeded(email, fullName = '') {
    logger.debug('begin function jamfRepo.createUserIfNeeded');
    let uniqueId = this.removeEmailSuffix(email);
    logger.debug('uniqueId: ' + uniqueId);
    await this.throttle.pauseIfNeeded();
    logger.debug('getting User by Email: ' + email);
    let user = await this.getUserByEmail(email);
    logger.debug('got back user value: ' + JSON.stringify({ user: user }));
    this.throttle.increment();
    if (user) {
      logger.info('Jamf User found: ' + JSON.stringify({ user: user }));
      return { success: true, user: user };
    }
    logger.info('jamf user not found; need to create: ' + email);
    let res = await this.createUser(uniqueId, email);
    logger.info(
      'results from attemt to create: ' +
        email +
        ' ' +
        JSON.stringify({ res, res })
    );
    return res;
  }
  async createUser(uniqueId, fullName = '') {
    logger.debug('jamfRepo creating user ' + uniqueId + ' ' + fullName);
    let xml = this.generateCreateUserXML(uniqueId, fullName);
    logger.debug('submitting Jamf new user data' + xml);
    logger.debug('submitting jamf data to POST: ' + this.api.newUserRoute);
    await this.throttle.pauseIfNeeded();
    let resXml = await this.api.submitPost(this.api.newUserRoute, xml);
    this.throttle.increment();
    logger.debug('received xml from jamf user creation: ' + resXml);
    let res = xmlParser.parse(resXml);
    if (res.hasOwnProperty('user')) {
      logger.info('Created Jamf user: ' + uniqueId);
      return { success: true, user: res.user };
    } else {
      logger.error(
        'Failed to create Jamf user: ' + uniqueId + JSON.stringify({ res: res })
      );
      return { success: false, res: res };
    }
  }

  async deleteUserByUid(uniqueId) {
    let email = this.addEmailSuffix(uniqueId);
    return await this.deleteUserByEmail(email);
  }

  async deleteUserByEmail(email) {
    let user = await this.getUserByEmail(email);
    if (user) {
      return await this.deleteUserById(user.id);
    }
    return false;
  }

  /* Group Membership methods */

  async getGroups() {
    try {
      let url = this.api.userGroupsRoute;
      await this.throttle.pauseIfNeeded();
      let res = await this.api.submitGet(url);
      this.throttle.increment();
      if (res.hasOwnProperty('user_groups')) {
        return res.user_groups.map(({ name, id }) => ({ name, id }));
      } else {
        return [];
      }
    } catch (err) {
      logger.error(
        'failed JamfRepo.getGroups' + JSON.stringify({ error: err })
      );
    }
  }

  async getGroupMembers(groupId) {
    try {
      let usernames;
      let url = this.api.userGroupRoute + groupId;
      await this.throttle.pauseIfNeeded();
      let res = await this.api.submitGet(url);
      this.throttle.increment();
      if (res.user_group && res.user_group.hasOwnProperty('users')) {
        usernames = res.user_group.users.map((user) => user.username);
        return this.addEmailSuffixes(usernames);
      } else {
        return [];
      }
    } catch (err) {
      logger.error(
        'failed JamfRepo.getGroupMembers' + JSON.stringify({ error: err })
      );
    }
  }

  async addUsersToGroup(groupId, users) {
    logger.debug(
      'adding Jamf users to group (in addUsersToGroup)' +
        JSON.stringify({
          group: groupId,
          users: users,
        })
    );
    let usernames = this.removeEmailSuffixes(users);
    let xml = this.generateAddOrDeleteXml('add', usernames);
    let url = this.api.userGroupRoute + groupId;
    await this.throttle.pauseIfNeeded();
    let res = await this.api.submitPut(url, xml);
    this.throttle.increment();
    return res;
  }

  async deleteUsersFromGroup(groupId, users) {
    logger.debug(
      'deleting Jamf users to group (in addUsersToGroup)' +
        JSON.stringify({
          group: groupId,
          users: users,
        })
    );

    let usernames = this.removeEmailSuffixes(users);
    let xml = this.generateAddOrDeleteXml('delete', usernames);
    let url = this.api.userGroupRoute + groupId;
    await this.throttle.pauseIfNeeded();
    let res = await this.api.submitPut(url, xml);
    this.throttle.increment();
    return res;
  }

  /* supporting methods */

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

  async getUserByEmail(email) {
    logger.debug('starting jamfRepo.getUserByEmail:' + email);
    let url = this.api.userEmailRoute + email;
    logger.debug('Getting Url (getUserByEmail): ' + url);
    await this.throttle.pauseIfNeeded();
    let res = await this.api.submitGet(url);
    this.throttle.increment();
    // logger.debug('jamfRepo.getUserByEmail got response ' + res.status);
    if (res.hasOwnProperty('users') && res.users.length > 0) {
      return res.users[0];
    } else {
      logger.error('JamfRepository getUserByEmail failed to find: ' + email);
      return false;
    }
  }

  async deleteUserById(id) {
    let url = this.api.userRoute + id;
    await this.throttle.pauseIfNeeded();
    let resXml = await this.api.submitDelete(url);
    this.throttle.increment();
    let res = xmlParser.parse(resXml);
    if (res.hasOwnProperty('user')) {
      return { success: true, action: 'delete', user: res.user };
    } else {
      return { success: false, attemptedAction: 'delete', res: res };
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
