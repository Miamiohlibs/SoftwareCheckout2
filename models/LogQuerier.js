const fs = require('fs');
const path = require('path');
const jq = require('node-jq');
const jsonifyLog = require('../helpers/jsonifyLog');
const firstline = require('firstline');
const { first } = require('lodash');

module.exports = class LogQuerier {
  constructor() {
    this.logDir = path.resolve(__dirname + '/../logs/');
  }

  async getLogDates() {
    const allFiles = fs.readdirSync(this.logDir);
    const files = allFiles.filter((file) => file.endsWith('.log'));
    // const files = fs.readdirSync(logDir);
    let knownDates = [];
    const logsByDate = [];

    let promises = files.map(async (file) => {
      let filepath = path.resolve(this.logDir + '/' + file);
      let resRaw = await firstline(filepath);
      let firstEntry;
      try {
        firstEntry = JSON.parse(resRaw) || {};
      } catch (e) {
        firstEntry = {};
      }
      // console.log(firstEntry.message);
      // info.push({ file, message: res.message });

      var stats = fs.statSync(filepath);
      if (stats.size == 0) {
        return;
      } // if fileSizeInBytes = 0, skip
      let date = file.split('.')[0];
      let [prefix, year, month, day] = date.split('-');
      let levels = {}; // array of filenames for a given date

      if (year != undefined) {
        firstline(filepath).then((line) => {
          try {
            this.firstEntry = JSON.parse(line) || {};
            console.log('set first entry:', firstEntry.message);
          } catch (e) {
            // console.log(e);
          }
        });

        if (knownDates.includes(`${year}-${month}-${day}`)) {
          let thisLog = logsByDate.find(
            (log) => log.year === year && log.month === month && log.day === day
          );
          thisLog.logType.push(prefix);
          thisLog.levels[`${prefix}`] = {
            filename: file,
            firstEntryMessage: firstEntry.message,
            firstEntryLevel: firstEntry.level,
            // firstEntryContent: firstEntry.content,
            fileSizeinBytes: stats.size,
          };
        } else {
          levels[`${prefix}`] = {
            filename: file,
            firstEntryMessage: firstEntry.message,
            firstEntryLevel: firstEntry.level,
            // firstEntryContent: firstEntry.content,
            fileSizeinBytes: stats.size,
          };
          logsByDate.push({
            levels,
            year,
            month,
            day,
            date: `${year}-${month}-${day}`,
            logType: [prefix],
          });
          knownDates.push(`${year}-${month}-${day}`);
        }
      }
    });

    await Promise.all(promises);
    return logsByDate;
  }

  redactFields(obj, redactedFields = [], redactedValuePrefixes = []) {
    // Iterate over the keys of the object
    // console.log('Redacting', redactedFields, redactedValuePrefixes);

    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        // If the key is in the redactedFields list, redact the value
        if (redactedFields.includes(key)) {
          obj[key] = '[Redacted]';
        }
        // If the value is a string, check if it starts with any of the redacted value prefixes
        else if (typeof obj[key] === 'string') {
          for (let prefix of redactedValuePrefixes) {
            if (obj[key].startsWith(prefix)) {
              // Redact the value but keep the prefix in the output
              obj[key] = `${prefix}[Redacted]`;
              break;
            }
          }
        }
        // If the value is an object or array, recursively call the function
        else if (typeof obj[key] === 'object' && obj[key] !== null) {
          this.redactFields(obj[key], redactedFields, redactedValuePrefixes);
        }
      }
    }

    return obj;
  }

  readLogFile(filename) {
    let jsonLog = jsonifyLog(path.resolve(this.logDir + '/' + filename));
    jsonLog = this.redactFields(
      jsonLog,
      ['Authorization'],
      [
        'LibCalApi Token:',
        'Bearer ',
        'https://usermanagement.adobe.io/v2/usermanagement/users/',
      ]
    );
    return jsonLog;
  }

  getUniqUids(entries) {
    const getUniqUids = '.entries | map (.uid) | unique';
    return jq.run(getUniqUids, JSON.stringify(entries), {
      input: 'string',
    });
  }

  async getFirstTimestampForUids(entries) {
    const firstTimestampForUids =
      '[.entries | group_by(.uid)| map({uid: .[0].uid, first_message: .[0].message, first_timestamp: (map(.timestamp) | min)}) | sort_by(.first_timestamp)]';
    const data = await jq.run(firstTimestampForUids, JSON.stringify(entries), {
      input: 'string',
    });
    return JSON.parse(data)[0];
  }

  async selectEntriesByField(entries, field, value) {
    const selectEntriesByField = `.entries | map(select(.${field} == "${value}"))`;
    const data = await jq.run(selectEntriesByField, JSON.stringify(entries), {
      input: 'string',
    });
    return JSON.parse(data);
  }

  //   const getUniqUids = '.entries | map (.uid) | unique';
  // const firstTimestampForUids =
  //   '[.entries | group_by(.uid)| map({uid: .[0].uid,first_timestamp: (map(.timestamp) | min)})]';

  // (async () => {
  //   const uids = await jq.run(firstTimestampForUids, JSON.stringify(entries), {
  //     input: 'string',
  //   });
  //   console.log(uids);
  // })();
};
