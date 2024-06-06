const mongoose = require('mongoose');
const appConf = require('../config/appConf');
const logger = require('../services/logger');
const fs = require('fs');
const path = require('path');

const activeDb = appConf.database.use;
const connectionString = appConf.database[activeDb].connection;
let config = appConf.database[activeDb].config;
if (config.sslCA && typeof config.sslCA == 'string') {
  try {
    config.sslCA = [
      fs.readFileSync(path.join(__dirname, '..', 'certs', config.sslCA)),
    ];
  } catch (err) {
    logger.error(
      'Could not find file ' + config.sslCA + ' in the certs/ directory'
    );
  }
}

const conf = (module.exports = {
  connect: async function () {
    try {
      mongoose.Promise = global.Promise;
      await mongoose.connect(connectionString, config);
      console.log('database connected');
    } catch (err) {
      console.log('could not connect to database');
      logger.error('could not connect to database: ', { content: err });
    }
  },

  disconnect: async function () {
    try {
      await mongoose.connection.close();
      console.log('database disconnected');
    } catch (err) {
      console.log('could not disconnect from database');
      logger.error('could not disconnect from database:', { content: err });
    }
  },
});
