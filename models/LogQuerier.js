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
      let date = file.split('.')[0];
      //   console.log(file);
      let [prefix, year, month, day] = date.split('-');
      // return { year, month, day };
      if (year != undefined) {
        if (knownDates.includes(`${year}-${month}-${day}`)) {
          logsByDate
            .find(
              (log) =>
                log.year === year && log.month === month && log.day === day
            )
            .logType.push(prefix);
        } else {
          logsByDate.push({
            file,
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

  redactFields(obj, redactedFields) {
    // Iterate over the keys of the object
    console.log('Redacting', redactedFields);
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        // If the key is "Authorization", redact the value
        if (redactedFields.includes(key)) {
          obj[key] = '[Redacted]';
        }
        // If the value is an object or array, recursively call the function
        else if (typeof obj[key] === 'object' && obj[key] !== null) {
          this.redactFields(obj[key], redactedFields);
        }
      }
    }
    return obj;
  }

  readLogFile(filename) {
    let jsonLog = jsonifyLog(path.resolve(this.logDir + '/' + filename));
    jsonLog = this.redactFields(jsonLog, ['Authorization']);
    return jsonLog;
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
