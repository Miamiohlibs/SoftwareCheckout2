module.exports = class AdobeSavingsCalcuator {
  constructor(conf) {
    this.conf = conf; // license cost (by date range?)
    this.knownBookIds = [];
    this.users = [];
    this.totalSavings = 0;
    this.monthlySavings = [];
  }

  calculateSavings() {
    // foreach file in ./logs/dailyStats/AdobeCreativeCloud
    //   get date
    //   foreach item in file
    //     if item.status == 'Confirmed'
    //       if item.bookId not in array of known bookIds
    //         add item.bookId to array of known bookIds
    //         this.processItem(item)
  }

  processItem(item) {
    // getUser(item.email)
    //  if user exists
    //    get last savings date
    //    if last savings date is more than 32 days ago
    //      incrementSavings(user, item)
  }

  getUser(email) {
    // if user exists in this.users
    //   return user
    // else
    //   return this.createUser(email)
  }

  createUser(email) {
    // create new user
    // add user to this.users
    // return user
  }

  incrementSavings(user, item) {
    // get license cost for item
    // increment user.savings by license cost
    // increment this.totalSavings by license cost
    // increment this.monthlySavings by license cost
    // set user.lastSavingsDate to item.fromDate
  }
};
