const MiamiDamApi = require('../models/MiamiDamApi');
const logger = require('../services/logger');

module.exports = class MiamiDamRepository {
  constructor(conf) {
    this.api = new MiamiDamApi(conf);
    this.baseUrl = this.api.baseUrl;
  }

  async getGroupMembers(group) {
    const queryConf = {
      method: 'get',
      url: this.baseUrl + '/members/' + group,
    };
    try {
      let res = await this.api.getQueryResults(queryConf);
      return res;
    } catch (err) {
      logger.error(
        `MiamiDamRepository.getGroupMembers received error: ${err.message} `,
      );
    }
  }

  async addGroupMember(group, memberId) {
    const queryConf = {
      method: 'post',
      url: this.baseUrl + '/members/' + group,
      data: {
        uniqueId: memberId,
      },
    };
    try {
      let res = await this.api.getQueryResults(queryConf);
      return res;
    } catch (err) {
      logger.error(
        `MiamiDamRepository.addGroupMember received error: ${err.message} `,
      );
    }
  }

  async removeGroupMember(group, memberId) {
    const queryConf = {
      method: 'delete',
      url: this.baseUrl + '/members/' + group + '/' + memberId,
    };
    try {
      let res = await this.api.getQueryResults(queryConf);
      return res;
    } catch (err) {
      logger.error(
        `MiamiDamRepository.removeGroupMember received error: ${err.message} `,
      );
    }
  }
};
