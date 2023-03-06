/*  
    Description: Calculates savings from Adobe Creative Cloud licenses
    Method:
        1. For each uniq bookId in the dailyStats/AdobeCreativeCloud/*.json files:
        2. Count cost savings on a per user basis:
            3. If the user hasn't previously checked out a license in the last 21 days
                (conf.chargeAfterDays), increment savings by conf.costPerUse
            4. If this is the third checkout in two months, whether or not to increment
                savings depends on the conf.thirdCheckoutFreeWithin setting. 
                (See note below.)
    Usage:
        let calc = new AdobeSavingsCalculator();
        calc.calculateSavings();
        console.log('Monthly Savings:', calc.monthlySavings);
        console.log('Total Savings: $', calc.totalSavings);
    Notes:
        You can also get a list of users by savings with:

        console.log(
          'User by savings',
          calc.users
            .sort((a, b) => b.savings - a.savings)
            .map((item) => item.email + ':' + item.savings)
        );

        thirdCheckoutFreeWithin is a hedge against a particular possible mis-accounting
        scenario. It's possible for a user to check out a license three times in two
        months, spaced far enough apart that they would be charged for the third even
        though it should be "free". The thirdCheckoutFreeWithin setting is the number
        of days that must elapse between the first and third checkouts for the third
        checkout to be charge -- any less than that, and the third checkout should be
        free.
*/

const { readdirSync } = require('fs');
const path = require('path');
const dayjs = require('dayjs');

module.exports = class AdobeSavingsCalculator {
  constructor(
    conf = { costPerUse: 20, chargeAfterDays: 21, thirdCheckoutFreeWithin: 50 }
  ) {
    this.conf = conf;
    this.knownBookIds = [];
    this.users = [];
    this.totalSavings = 0;
    this.monthlySavings = [];
  }

  calculateSavings() {
    // foreach file in ./logs/dailyStats/AdobeCreativeCloud
    let dirname = 'AdobeCreativeCloud';
    let files = this.getFiles(dirname);
    files.forEach((file) => {
      this.processFile(dirname, file.name);
    });
    // console.log('Monthly Savings', this.monthlySavings);
    // console.log('Total Savings', this.totalSavings);
  }

  getFiles(dirname) {
    // get list of files in a directory
    let thisfolder = path.resolve(
      __dirname,
      '../logs/dailyStats/' + dirname + '/'
    );
    // return files with datestamp in filename + .json
    let files = readdirSync(thisfolder, { withFileTypes: true })
      .filter((dirent) => dirent.isFile())
      .filter((dirent) => dirent.name.match(/\d\d\d\d-\d\d-\d\d\.json$/));
    return files;
  }

  processFile(dirname, filename) {
    let date = filename.replace('.json', '');
    let data = require(`../logs/dailyStats/${dirname}/${filename}`);
    let confirmedBookings = data.filter((item) => item.status == 'Confirmed');
    confirmedBookings.forEach((item) => {
      if (!this.knownBookIds.includes(item.bookId)) {
        this.knownBookIds.push(item.bookId);
        // console.log('New bookId', item.bookId);
        this.processItem(item, date);
      }
    });
  }

  processItem(item, date) {
    let user = this.getUser(item.email);
    if (user.lastSavingsDate == null) {
      this.incrementSavings(user, item);
    } else {
      let daysSinceSavings = Math.abs(
        dayjs(date).diff(user.lastSavingsDate, 'day')
      );
      if (daysSinceSavings > this.conf.chargeAfterDays) {
        if (user.previousSavingsDate == null) {
          this.incrementSavings(user, item);
        } else {
          let daysSincePreviousSavings = Math.abs(
            dayjs(date).diff(user.previousSavingsDate, 'day')
          );
          if (daysSincePreviousSavings > this.conf.thirdCheckoutFreeWithin) {
            this.incrementSavings(user, item);
          }
        }
      }
    }
    //  if user exists
    //    get last savings date
    //    if last savings date is more than this.conf.chargeAfterDays days ago
    //      this.incrementSavings(user, item)
  }

  getUser(email) {
    let user = this.users.find((user) => user.email == email);
    if (!user) {
      user = this.createUser(email);
    }
    // console.log(user);
    return user;
  }

  createUser(email) {
    let user = {
      email: email,
      savings: 0,
      lastSavingsDate: null,
      previousSavingsDate: null,
    };
    this.users.push(user);
    return user;
  }

  incrementSavings(user, item) {
    // get license cost for item
    let cost = this.conf.costPerUse;

    // increment user.savings by license cost
    user.savings += cost;

    // increment this.totalSavings by license cost
    this.totalSavings += cost;

    // increment this.monthlySavings by license cost
    let month = dayjs(item.fromDate).format('YYYY-MM');
    if (!this.monthlySavings[month]) {
      this.monthlySavings[month] = 0;
    }
    this.monthlySavings[month] += cost;

    // set user.previousSavingsDate to user.lastSavingsDate
    user.previousSavingsDate = user.lastSavingsDate;

    // set user.lastSavingsDate to item.fromDate
    user.lastSavingsDate = item.fromDate;
  }
};
