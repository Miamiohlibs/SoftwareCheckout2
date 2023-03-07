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
        A conf object can be passed to the constructor to override the default.
        The defaults are set to assume a $20 cost per use and a 14-day checkout 
        period. chargeAfterDays is 21 to allow a little wiggle room for renewing.

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
        free. The default is 50 days, which allows a little wiggle room -- the third
        checkout (14 days) will extend a bit past 2 months and still be counted as free.
*/

const { readdirSync } = require('fs');
const path = require('path');
const dayjs = require('dayjs');

module.exports = class AdobeSavingsCalculator {
  constructor(conf) {
    this.conf = conf || {};
    if (conf == null || conf.costPerUse == null) {
      this.conf.costPerUse = 20;
    }
    if (conf == null || conf.chargeAfterDays == null) {
      this.conf.chargeAfterDays = 21;
    }
    if (conf == null || conf.thirdCheckoutFreeWithin == null) {
      this.conf.thirdCheckoutFreeWithin = 50;
    }
    if (conf == null || conf.dirname == null) {
      this.conf.dirname = 'AdobeCreativeCloud';
    }
    this.knownBookIds = [];
    this.users = [];
    this.totalSavings = 0;
    this.monthlySavings = [];
  }

  calculateSavings() {
    // foreach file in ./logs/dailyStats/AdobeCreativeCloud/*.json
    let files = this.getFiles(this.conf.dirname);
    files.forEach((file) => {
      this.processFile(this.conf.dirname, file.name);
    });
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
        this.processItem(item, date);
      }
    });
  }

  processItem(item, date) {
    let user = this.getUser(item.email);
    // always credit savings for first checkout
    if (user.lastSavingsDate == null) {
      this.incrementSavings(user, item);
    } else {
      let daysSinceSavings = Math.abs(
        dayjs(date).diff(user.lastSavingsDate, 'day')
      );
      // if it's been long enough since last savings, credit savings
      if (daysSinceSavings > this.conf.chargeAfterDays) {
        if (user.previousSavingsDate == null) {
          this.incrementSavings(user, item);
        } else {
          let daysSincePreviousSavings = Math.abs(
            dayjs(date).diff(user.previousSavingsDate, 'day')
          );
          // but don't credit savings for the third time in 2 months
          if (daysSincePreviousSavings > this.conf.thirdCheckoutFreeWithin) {
            this.incrementSavings(user, item);
          }
        }
      }
    }
  }

  getUser(email) {
    let user = this.users.find((user) => user.email == email);
    if (!user) {
      user = this.createUser(email);
    }
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
    if (!this.monthlySavings.find((item) => item.month == month)) {
      this.monthlySavings.push({ month: month, savings: cost });
    } else {
      this.monthlySavings.find((item) => item.month == month).savings += cost;
    }

    // set user.previousSavingsDate to user.lastSavingsDate
    user.previousSavingsDate = user.lastSavingsDate;

    // set user.lastSavingsDate to item.fromDate
    user.lastSavingsDate = item.fromDate;
  }
};
