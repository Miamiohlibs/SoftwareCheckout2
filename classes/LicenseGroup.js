const appConf = require('../config/appConf');

module.exports = class LicenseGroup {
  constructor(conf) {
    this.software = conf.software;
  }

  getLicenseGroupsByVendor(vendor, limitToActive = true) {
    return this.software.filter((i) => i.vendor == vendor && i.active == true);
  }

  getVendorGroupNamesByVendor(vendor, limitToActive = true) {
    let objects = this.getLicenseGroupsByVendor(vendor);
    return objects.map((i) => i.vendorGroupName);
  }
};
