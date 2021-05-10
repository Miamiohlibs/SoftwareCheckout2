const LibCalApi = require('../models/LibCalApi');
const dayjs = require('dayjs');
const logger = require('../services/logger');

module.exports = class LibCalService {
  constructor(conf) {
    this.api = new LibCalApi(conf);
  }

  async getCurrentValidBookings(cid) {
    let res = await this.api.getBookings(cid);
    logger.debug(`received from getBookings ${cid}`, { results: res });
    let current = this.filterToCurrentBookings(res);
    let valid = this.filterToValidBookings(current);
    logger.debug(`getCurrentValidBookings returns ${cid}:`, {
      validBookings: valid,
    });
    return valid;
  }

  filterToCurrentBookings(bookings) {
    return bookings.filter(
      (i) => dayjs(i.fromDate) < dayjs() && dayjs(i.toDate) > dayjs()
    );
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
