const mongoose = require('mongoose');
const UniqEmail = require('../models/UniqEmail');
const appConf = require('../config/appConf');
const logger = require('../services/logger');

module.exports = class UniqEmailRepository {
  async connect(connectString = appConf.emailConverter.db_connection) {
    try {
      mongoose.connect(
        connectString,
        { useNewUrlParser: true, useUnifiedTopology: true },
        () => {
          console.log('connected to db');
        }
      );
    } catch (err) {
      logger.error('Failed to connect to db', err);
    }
  }

  async queryAllEmails() {
    return await UniqEmail.find();
  }

  async querySpecificEmails(emails) {
    let query = this.buildEmailsQuery(emails);
    return await UniqEmail.find(query);
  }

  buildEmailsQuery(emails) {
    let objArr = [];
    emails.forEach((email) => {
      objArr.push({ email: email });
    });
    return {
      $or: objArr,
    };
  }

  getKnownAndUnknownEmails(needles, haystack) {
    let found = [];
    let missing = [];
    needles.forEach((email) => {
      let res = this.getUniqForEmail(email, haystack);
      if (res.length > 0) {
        found.push(res[0]);
      } else {
        missing.push(email);
      }
    });
    return { found: found, missing: missing };
  }

  getUniqForEmail(needle, haystack) {
    return haystack
      .filter((obj) => obj.email == needle)
      .map((obj) => obj.uniqEmail);
  }

  async disconnect() {
    mongoose.connection.close();
  }
};
