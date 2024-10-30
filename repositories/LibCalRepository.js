const LibCalApi = require('../models/LibCalApi');
const dayjs = require('dayjs');
const logger = require('../services/logger');
const { axiosLogPrep } = require('../helpers/utils');

module.exports = class LibCalService {
  constructor(conf) {
    this.api = new LibCalApi(conf);
  }

  async getCurrentValidBookings(cid) {
    let res = await this.api.getBookings(cid);
    logger.debug(`LibCalRepository: received from getBookings ${cid}`, {
      content: axiosLogPrep(res),
    });
    let current = this.filterToCurrentBookings(res);
    let valid = this.filterToValidBookings(current);
    logger.debug(`LibCalRepository: getCurrentValidBookings returns ${cid}:`, {
      content: valid,
    });
    return valid;
  }

  async getValidFutureBookings(cid) {
    let res = await this.api.getBookings(cid, null, 365); // 365 days in the future
    logger.debug(`LibCalRepository: received from getBookings ${cid}`, {
      content: axiosLogPrep(res),
    });
    let future = this.filterToFutureBookings(res);
    let validFutureBookings = this.filterToValidBookings(future);
    logger.debug(`LibCalRepository: getValidFutureBookings returns ${cid}:`, {
      content: validFutureBookings,
    });
    return validFutureBookings;
  }

  filterToCurrentBookings(bookings) {
    return bookings.filter(
      (i) => dayjs(i.fromDate) < dayjs() && dayjs(i.toDate) > dayjs()
    );
  }

  filterToFutureBookings(bookings) {
    return bookings.filter((i) => dayjs(i.fromDate) > dayjs());
  }

  filterToValidBookings(bookings) {
    return bookings.filter(
      (i) => i.status === 'Confirmed' || i.status === 'Mediated Approved'
    );
  }

  getUniqueEmailsFromBookings(bookings) {
    let emails = bookings.map((item) => {
      return item.email;
    });
    let unique = [...new Set(emails)];
    return unique;
  }
};
