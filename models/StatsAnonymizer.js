const { create } = require('lodash');
const { cryptoConfig } = require('../config/appConf');
// console.log(cryptoConfig.secret);
const crypto = require('crypto');

module.exports = class StatsAnonymizer {
  constructor(secret = null) {
    if (secret) {
      this.secret = secret;
    } else {
      throw new Error('No secret provided');
    }
  }
  anonymizeString(str) {
    return crypto.createHash('md5').update(str).digest('hex');
  }
  anonymizeObject(obj, fields) {
    let newObj = {};
    for (let [key, value] of Object.entries(obj)) {
      if (fields.includes(key)) {
        newObj[key] = this.anonymizeString(value);
      } else {
        newObj[key] = value;
      }
    }
    return newObj;
  }
  anonymizeArray(arr, fields) {
    let newArr = [];
    arr.forEach((obj) => {
      newArr.push(this.anonymizeObject(obj, fields));
    });
    return newArr;
  }
};
