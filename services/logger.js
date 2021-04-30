const path = require('path');
const dayjs = require('dayjs');
const today = dayjs().format('YYYY-MM-DD');
const month = dayjs().format('YYYY-MM');
const infolog = path.join(__dirname, '..', 'logs', 'info-' + month + '.log');
const debuglog = path.join(__dirname, '..', 'logs', 'debug-' + today + '.log');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;

const logger = createLogger({
  format: combine(timestamp(), prettyPrint()),
  transports: [
    // new winston.transports.Console(),
    // new transports.File({ filename: debuglog, level: 'debug' }),
    new transports.File({ filename: infolog, level: 'info' }),
  ],
});
module.exports = logger;
