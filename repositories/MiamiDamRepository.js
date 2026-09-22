const MiamiDamApi = require('../models/MiamiDamApi');
const logger = require('../services/logger');

module.exports = class MiamiDamRepository {
  constructor(conf) {
    this.api = new MiamiDamApi(conf);
    this.baseUrl = conf.baseUrl;
    this.emailSuffix = conf.emailSuffix;
  }

  async getGroupMembers(group) {
    const queryConf = {
      method: 'get',
      url: this.baseUrl + '/members/' + group,
    };
    try {
      let res = await this.api.getQueryResults(queryConf);
      if (res.status == 200) {
        return res.data;
      } else {
        const message = `Could not get group members for ${group}`;
        logger.error(`status: ${res.status}; message: ${message}`);
        return {
          success: false,
          status: res.status,
          error: message,
        };
      }
    } catch (err) {
      logger.error(
        `MiamiDamRepository.getGroupMembers received error: ${err.message} `,
      );
    }
  }

  async getOneGroupMember(uniqueId, group) {
    const queryConf = {
      method: 'get',
      url: this.baseUrl + '/members/' + group + '/' + uniqueId,
    };
    try {
      let res = await this.api.getQueryResults(queryConf);
      logger.debug(
        `result status ${res.status} for lookup user ${uniqueId} in group ${group}`,
      );
      if (res.status == 200) {
        return res.data;
      } else {
        const message = `Could not find group member ${uniqueId} in group ${group}`;
        logger.error(`status: ${res.status}; message: ${message}`);
        return {
          success: false,
          status: res.status,
          error: message,
        };
      }
    } catch (err) {
      logger.error(
        `MiamiDamRepository.getOneGroupMember received error: ${err.message} `,
      );
    }
  }

  async addOneGroupMember(uniqueId, group) {
    logger.debug(`addGroupMember: ${uniqueId} to group ${group}`);
    const queryConf = {
      method: 'post',
      url: this.baseUrl + '/members/' + group,
      data: {
        uniqueId: uniqueId,
      },
    };
    try {
      const res = await this.api.getQueryResults(queryConf);
      logger.debug(
        `Response adding user ${uniqueId} to group ${group} - status: ${res.status}}`,
      );
      if (res.status == 202) {
        logger.debug(`successfully added user ${uniqueId} to group ${group}`);
        return { success: true };
      } else {
        logger.debug(`failed to add user ${uniqueId} to group ${group}`);
        return { success: false };
      }
      // return res.data;
    } catch (err) {
      logger.error(
        `MiamiDamRepository.addGroupMember received error: ${err.message} `,
      );
      logger.debug(`failed to add user ${uniqueId} to group ${group}`);
      return { success: false };
    }
  }

  async addGroupMembers(uniqueIdList, group) {
    logger.debug(`addGroupMembers: ${JSON.stringify(uniqueIdList)}`);
    const promises = uniqueIdList.map(async (user) => {
      return await this.addOneGroupMember(user, group);
    });
    return await Promise.all(promises);
  }

  async removeOneGroupMember(uniqueId, group) {
    const queryConf = {
      method: 'delete',
      url: this.baseUrl + '/members/' + group + '/' + uniqueId,
    };
    try {
      let res = await this.api.getQueryResults(queryConf);
      if (res.status == 202) {
        // that's the success condition
        return { success: true, status: res.status };
      } else {
        logger.error(
          `Failed to remove group member ${uniqueId} from group ${group}`,
        );
      }
    } catch (err) {
      logger.error(
        `MiamiDamRepository.removeGroupMember received error: ${err.message} `,
      );
    }
  }

  async removeGroupMembers(uniqueIdList, group) {
    logger.debug(`removeGroupMembers: ${JSON.stringify(uniqueIdList)}`);
    const promises = uniqueIdList.map(async (user) => {
      return await this.removeOneGroupMember(user, group);
    });
    return await Promise.all(promises);
  }

  getEmailsFromGroupMembers(uniqueIdList) {
    return uniqueIdList.map((item) => `${item.uniqueId}${this.emailSuffix}`);
  }

  getUniqueIdsFromEmails(emailList) {
    return emailList.map((email) => email.replace(this.emailSuffix, ''));
  }
};
