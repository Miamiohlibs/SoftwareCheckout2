const LibCalApi = require('../models/LibCalApi');
const Utils = require('../classes/Utils');
const util = new Utils();
const winston = require('winston');
const logpath = __dirname + '/combined.log';
const dayjs = require('dayjs');
const logger = winston.createLogger({
  transports: [
    // new winston.transports.Console(),
    new winston.transports.File({ filename: logpath, level: 'info' }),
  ],
});

module.exports = class LibCalService {
  constructor(conf) {
    this.api = new LibCalApi(conf);
  }

  async getCurrentValidBookings(cid) {
    let res = await this.api.getBookings(cid);
    let current = this.filterToCurrentBookings(res);
    let valid = this.filterToValidBookings(current);
    return valid;
  }

  filterToCurrentBookings(input) {
    return input.filter(
      (i) => dayjs(i.fromDate) < dayjs() && dayjs(i.toDate) > dayjs()
    );
  }

  filterToValidBookings(input) {
    return input.filter(
      (i) => i.status === 'Confirmed' || i.status === 'Mediated Approved'
    );
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

  // getEmailsFromBookings(bookings) {
  //   return bookings.map((item) => {
  //     return item.email;
  //   });
  // }
};
