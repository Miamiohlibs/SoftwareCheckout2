const mongoose = require('mongoose');
const appConf = require('../config/appConf');
const logger = require('../services/logger');

const connectionString = appConf.db_connection;
module.exports = {
  connect: async function () {
    try {
      mongoose.Promise = global.Promise;
      await mongoose.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('database connected');
    } catch (err) {
      console.log(err);
    }
  },

  disconnect: async function () {
    try {
      await mongoose.connection.close();
      console.log('database disconnected');
    } catch (err) {
      console.log(err);
    }
  },
};
