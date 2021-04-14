const appConf = require('../config/appConf');

module.exports = class LicenseGroup {
  constructor(conf) {
    this.software = conf.software;
  }

  getLicenseGroupsByVendor(vendor) {
    return this.software.filter((i) => i.vendor == vendor);
  }

  getVendorGroupNamesByVendor(vendor) {
    let objects = this.getLicenseGroupsByVendor(vendor);
    return objects.map((i) => i.vendorGroupName);
  }
};
