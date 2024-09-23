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
    files.map((file) => {
      file = file.split('.')[0];
      //   console.log(file);
      if (file.match(/\d\d\d\d-\d\d\-\d\d/)) {
        let [prefix, year, month, day] = file.split('-');
        // return { year, month, day };
        if (year != undefined && month != undefined && day != undefined) {
          if (!logsByDate.hasOwnProperty(year)) {
            logsByDate[year] = [];
          }
          if (!logsByDate[year].hasOwnProperty(month)) {
            logsByDate[year][month] = [];
          }
          if (!logsByDate[year][month].hasOwnProperty(day)) {
            logsByDate[year][month][day] = [];
          }
          logsByDate[year][month][day].push(prefix);
        }
      }
    });
    return logsByDate;
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
