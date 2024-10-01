const fs = require('fs');
const path = require('path');
const jq = require('node-jq');
const jsonifyLog = require('../helpers/jsonifyLog');

module.exports = class LogQuerier {
  constructor() {
    this.logDir = path.resolve(__dirname + '/../logs/');
  }

  getLogDates() {
    const files = fs.readdirSync(this.logDir);
    const logsByDate = [];
    const knownDates = [];
    files.map((file) => {
      // console.log(file);
      this.firstEntry = { message: '', level: '' };
      let filepath = path.resolve(this.logDir + '/' + file);
      var stats = fs.statSync(filepath);
      if (stats.size == 0) {
        return;
      } // if fileSizeInBytes = 0, skip
      let date = file.split('.')[0];
      let [prefix, year, month, day] = date.split('-');
      let levels = {}; // array of filenames for a given date

      if (year != undefined) {
        if (knownDates.includes(`${year}-${month}-${day}`)) {
          let thisLog = logsByDate.find(
            (log) => log.year === year && log.month === month && log.day === day
          );
          thisLog.logType.push(prefix);
          thisLog.levels[`${prefix}`] = {
            filename: file,
            fileSizeinBytes: stats.size,
          };
        } else {
          levels[`${prefix}`] = {
            filename: file,
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

    return logsByDate.sort((a, b) => {
      return a.date < b.date ? 1 : -1;
    });
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
