module.exports = class LicenseGroup {
  constructor(conf) {
    this.software = conf.software;
  }

  getActiveEntries() {
    return this.software.filter((i) => i.active == true);
  }

  getActiveVendors() {
    let objects = this.getActiveEntries();
    let activeVendors = objects.map((i) => i.vendor);
    return [...new Set(activeVendors)];
  }

  getLicenseGroupsByVendor(vendor, limitToActive = true) {
    return this.software.filter((i) => i.vendor == vendor && i.active == true);
  }

  getVendorGroupNamesByVendor(vendor, limitToActive = true) {
    let objects = this.getLicenseGroupsByVendor(vendor);
    return objects.map((i) => i.vendorGroupName);
  }
};
