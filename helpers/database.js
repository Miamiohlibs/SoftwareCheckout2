const mongoose = require('mongoose');
const appConf = require('../config/appConf');
const logger = require('../services/logger');
const fs = require('fs');
const path = require('path');
const util = require('util');

const activeDb = appConf.database.use;
const connectionString = appConf.database[activeDb].connection;
let config = appConf.database[activeDb].config;
if (config.sslCA && typeof config.sslCA == 'string') {
  const certsPath = path.join(__dirname, '..', 'certs', config.sslCA);

  try {
    config.sslCA = [fs.readFileSync(certsPath)];
    config.tlsCAFile = sslCA;
    delete config.sslCA;
  } catch (err) {
    logger.error(
      'Could not find file ' +
        config.sslCA +
        ' in the ' +
        certsPath +
        ' directory',
    );
  }
}

const conf = (module.exports = {
  connect: async function () {
    try {
      mongoose.Promise = global.Promise;
      await mongoose.connect(connectionString, config);
      console.log('database connected');
      return true;
    } catch (err) {
      console.log('could not connect to database');
      // console.log('Error inspect: ', util.inspect(err, { depth: null }));
      logger.error('database.js: could not connect to database: ', {
        message: err.message,
        name: err.name,
        code: err.code,
        errors: err.errors, // AggregateError sub-errors, if present
        cause: err.cause, // sometimes holds the AggregateError
      });
      throw new Error(err);
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
