const appConf = require('../config/appConf');
const path = require('path');
const dayjs = require('dayjs');
const today = dayjs().format('YYYY-MM-DD');
const month = dayjs().format('YYYY-MM');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;

transportsArr = [];
for (level in appConf.logLevels) {
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

const timezoned = () => { 
  return new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York'
  });
}

const logger = createLogger({
  format: combine(
    timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    prettyPrint(),
    format.json()
    // format.json((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: transportsArr,
});
module.exports = logger;
