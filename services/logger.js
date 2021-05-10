const appConf = require('../config/appConf');
const path = require('path');
const dayjs = require('dayjs');
const today = dayjs().format('YYYY-MM-DD');
const month = dayjs().format('YYYY-MM');
// const infolog = path.join(__dirname, '..', 'logs', 'info-' + month + '.log');
// const debuglog = path.join(__dirname, '..', 'logs', 'debug-' + today + '.log');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;

transportsArr = [];
for (level in appConf.logLevels) {
  // console.log(level, appConf.logLevels[level]);
  filename = '';
  if (appConf.logLevels[level] == 'daily') {
    filename = path.join(__dirname, '..', 'logs', level + '-' + today + '.log');
  } else if (appConf.logLevels[level] == 'monthly') {
    filename = path.join(__dirname, '..', 'logs', level + '-' + month + '.log');
  }
  if (filename != '') {
    transportsArr.push(
      new transports.File({ filename: filename, level: level })
    );
  }
}

const logger = createLogger({
  format: combine(
    timestamp(),
    prettyPrint()
    // format.json((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: transportsArr,
});
module.exports = logger;
