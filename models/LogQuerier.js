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
