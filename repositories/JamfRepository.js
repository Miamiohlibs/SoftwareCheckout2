const JamfApi = require('../models/JamfApi');
const o2x = require('object-to-xml');
const logger = require('../services/logger');
const Throttle = require('../helpers/Throttle');
const { XMLParser } = require('fast-xml-parser');
const xmlParser = new XMLParser();

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
    logger.debug('jamfRepository: begin function jamfRepo.createUserIfNeeded');
    let uniqueId = this.removeEmailSuffix(email);
    logger.debug(`jamfRepository: uniqueId: ${uniqueId}`);
    await this.throttle.pauseIfNeeded();
    logger.debug(`jamfRepository: getting User by Email ${email}`);
    let user = await this.getUserByEmail(email);
    logger.debug('jamfRepository: got back user value', { content: user });
    this.throttle.increment();
    if (user) {
      logger.info('jamfRepository: Jamf User found: ', { content: user });
      return { success: true, user: user };
    }
    logger.info(
      `jamfRepository: jamf user not found; need to create: ${email}`
    );
    let res = await this.createUser(uniqueId, email);
    logger.info(
      `jamfRepository: results from attemt to create user ${email} `,
      { content: res }
    );
    return res;
  }

  async createUser(uniqueId, fullName = '') {
    logger.debug(
      `jamfRepository: jamfRepo creating user ${uniqueId}, ${fullName}`
    );
    let xml = this.generateCreateUserXML(uniqueId, fullName);
    logger.debug('jamfRepository: submitting Jamf new user data', {
      content: xml,
    });
    logger.debug(
      `jamfRepository: submitting jamf data to POST: ${this.api.newUserRoute}`
    );
    await this.throttle.pauseIfNeeded();
    let resXml = await this.api.submitPost(this.api.newUserRoute, xml);
    this.throttle.increment();
    logger.debug('jamfRepository: received xml from jamf user creation', {
      content: resXml,
    });
    let res = xmlParser.parse(resXml);
    if (res.hasOwnProperty('user')) {
      logger.info(`jamfRepository: Created Jamf user: ${uniqueId}`);
      return { success: true, user: res.user };
    } else {
      logger.error(`jamfRepository: Failed to create Jamf user: ${uniqueId}`, {
        content: res,
      });
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
      logger.error('jamfRepository: failed JamfRepo.getGroups', {
        content: err,
      });
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
      logger.error('jamfRepository: failed JamfRepo.getGroupMembers', {
        content: err,
      });
    }
  }

  async addUsersToGroup(groupId, users) {
    logger.debug(
      'jamfRepository: adding Jamf users to group (in addUsersToGroup)',
      { content: { group: groupId, users: users } }
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
      'jamfRepository: deleting Jamf users to group (in addUsersToGroup)',
      { content: { group: groupId, users: users } }
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
    logger.debug(`jamfRepository: starting jamfRepo.getUserByEmail: ${email}`);
    let url = this.api.userEmailRoute + email;
    logger.debug(`jamfRepository: Getting Url (getUserByEmail): ${url}`);
    await this.throttle.pauseIfNeeded();
    let res = await this.api.submitGet(url);
    this.throttle.increment();
    // logger.debug('jamfRepo.getUserByEmail got response ' + res.status);
    if (res.hasOwnProperty('users') && res.users.length > 0) {
      return res.users[0];
    } else {
      logger.error(
        `jamfRepository: JamfRepository getUserByEmail failed to find: ${email}`
      );
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
