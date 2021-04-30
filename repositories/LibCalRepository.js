const LibCalApi = require('../models/LibCalApi');
const Utils = require('../classes/Utils');
const util = new Utils();
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

  // async getLibCalLists() {
  //   try {
  //     let categories = await this.getOneLibCalList('categories');
  //     let cats = JSON.parse(categories);
  //     console.log();
  //     const allLists = [];
  //     await util.asyncForEach(cats[0].categories, async (item) => {
  //       // console.log(item);
  //       let response = await this.getOneLibCalList(
  //         'bookings',
  //         '&cid=' + item.cid
  //       );
  //       let parsed = JSON.parse(response);
  //       let obj = { cid: item.cid, name: item.name, bookings: parsed }; //, categories: categories }
  //       // console.log('ID:',item.cid)
  //       // response[item.cid] = obj;
  //       allLists.push(obj);
  //     });
  //     // this.lcSoftware = allLists;
  //     return allLists;
  //   } catch (err) {
  //     console.log('Error getting LibCal lists:', err);
  //   }
  // }

  // mapLibCal2ShortName(cids, crosswalk) {
  //   // adds a .campusCode property to each LibCal cid element
  //   // note: the LibCal.name must exactly match the software[] object.name property defined in configs/appConf
  //   // crosswalk should be the .software property of the appConf configuration, containing a name and shortName
  //   cids.forEach((libCalElement) => {
  //     crosswalk.map((item) => {
  //       if (libCalElement.name == item.name) {
  //         libCalElement.shortName = item.shortName;
  //       }
  //     });
  //   });
  //   return cids;
  // }

  // getCurrentLibCalBookings(cid) {
  //   // checks the software array for bookings that are current (active as of now) and status=confirmed
  //   // returns an array with a subset of booked software
  //   bookings =
  //   // filter to current
  //   let currentBookings = bookings.filter((obj) => {
  //     let toDate = Date.parse(obj.toDate);
  //     let fromDate = Date.parse(obj.fromDate);
  //     return Date.now() > fromDate && Date.now() < toDate;
  //   });
  //   // limit to confirmed bookings (not cancelled, etc)
  //   return currentBookings.filter((obj) => {
  //     return obj.status === 'Confirmed' || obj.status === 'Mediated Approved';
  //   });
  // }

  // }
};
