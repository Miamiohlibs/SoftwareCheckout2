const path = require('path');
const infolog = path.join(__dirname, '..', 'logs', 'info.log');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;

const logger = createLogger({
  format: combine(timestamp(), prettyPrint()),
  transports: [
    // new winston.transports.Console(),
    new transports.File({ filename: infolog }),
  ],
});
module.exports = logger;
