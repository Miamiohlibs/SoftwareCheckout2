// const mongoose = require('mongoose');
const UniqEmail = require('../models/UniqEmail');
const appConf = require('../config/appConf');
const logger = require('../services/logger');
const database = require('../helpers/database.js');
const { asyncForEach } = require('../helpers/utils');

module.exports = class UniqEmailRepository {
  async connect() {
    try {
      return await database.connect();
    } catch (err) {
      logger.error('UniqEmailRepository: Error connecting to database', {
        content: err,
      });
    }
  }

  async disconnect() {
    return await database.disconnect();
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

  /* updateObjectsWithKnownEmails
    accepts an array of objects and the name of the property containing an email address
    looks up the authoritative email address
    returns a "found" array of objects with known authEmails
     and a "missing" array of unaltered objects
  */
  updateObjectsWithKnownEmails(arr, key, haystack) {
    let found = [];
    let missing = [];

    arr.forEach((obj) => {
      let objCopy = obj; // create a copy
      let authEmail = this.getUniqForEmail(obj[key], haystack);
      if (authEmail.length > 0) {
        objCopy[key] = authEmail[0];
        found.push(objCopy);
        // console.log('found and pushed', obj[key]);
      } else {
        missing.push(obj);
        // console.log('could not find', obj[key]);
      }
    });
    return { found: found, missing: missing };
  }

  getUniqForEmail(needle, haystack) {
    return haystack
      .filter((obj) => obj.email == needle)
      .map((obj) => obj.uniqEmail);
  }

  async addNewEmailPairs(arr) {
    // expects and array of objects with 'email' and 'uniqEmail'
    try {
      return UniqEmail.insertMany(arr);
    } catch (err) {
      logger.error(
        'UniqEmailRepository: Error inserting new emails into database',
        { content: { emailArray: arr, error: err } }
      );
    }
  }

  async deleteEmailByAlias(email) {
    try {
      return UniqEmail.findOneAndDelete({ email: email });
    } catch (err) {
      logger.error(`UniqEmailRepository: Error deleting email ${email}:`, {
        content: err,
      });
    }
  }
  // async disconnect() {
  //   mongoose.connection.close();
  // }
};
