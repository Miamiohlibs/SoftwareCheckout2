const MiamiDamApi = require('../models/MiamiDamApi');
const logger = require('../services/logger');

module.exports = class MiamiDamRepository {
  constructor(conf) {
    this.api = new MiamiDamApi(conf);
    this.baseUrl = this.api.baseUrl;
    this.emailSuffix = conf.emailSuffix;
  }

  async getGroupMembers(group) {
    const queryConf = {
      method: 'get',
      url: this.baseUrl + '/members/' + group,
    };
    try {
      let res = await this.api.getQueryResults(queryConf);
      return res.data;
    } catch (err) {
      logger.error(
        `MiamiDamRepository.getGroupMembers received error: ${err.message} `,
      );
    }
  }

  async getOneGroupMember(memberId, group) {
    const queryConf = {
      method: 'get',
      url: this.baseUrl + '/members/' + group + '/' + memberId,
    };
    try {
      let res = await this.api.getQueryResults(queryConf);
      return res.data;
    } catch (err) {
      logger.error(
        `MiamiDamRepository.getOneGroupMember received error: ${err.message} `,
      );
    }
  }

  async addGroupMember(memberId, group) {
    logger.debug(`addGroupMember: ${memberId}`);
    const queryConf = {
      method: 'post',
      url: this.baseUrl + '/members/' + group,
      data: {
        uniqueId: memberId,
      },
    };
    try {
      let res = await this.api.getQueryResults(queryConf);
      return res.data;
    } catch (err) {
      logger.error(
        `MiamiDamRepository.addGroupMember received error: ${err.message} `,
      );
    }
  }

  async addGroupMembers(userList, group) {
    logger.debug(`addGroupMembers: ${JSON.stringify(userList)}`);
    const promises = userList.map(async (user) => {
      return await this.addGroupMember(user, group);
    });
    return await Promise.all(promises);
  }

  async removeGroupMember(memberId, group) {
    const queryConf = {
      method: 'delete',
      url: this.baseUrl + '/members/' + group + '/' + memberId,
    };
    try {
      let res = await this.api.getQueryResults(queryConf);
      return res.data;
    } catch (err) {
      logger.error(
        `MiamiDamRepository.removeGroupMember received error: ${err.message} `,
      );
    }
  }

  async removeGroupMembers(userList, group) {
    logger.debug(`removeGroupMembers: ${JSON.stringify(userList)}`);
    const promises = userList.map(async (user) => {
      return await this.removeGroupMember(user, group);
    });
    return await Promise.all(promises);
  }

  getEmailsFromGroupMembers(groupList) {
    return groupList.map((item) => `${item.uniqueId}${this.emailSuffix}`);
  }

  getMemberIdsFromEmails(emailList) {
    return emailList.map((email) => email.replace(this.emailSuffix, ''));
  }
};
