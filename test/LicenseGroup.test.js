const appConfMixed = require('./sample-data/appConfSample');
const LicenseGroup = require('../helpers/LicenseGroup');
const obj = new LicenseGroup(appConfMixed);

describe('initialization', () => {
  it('should initialize as a LicenseGroup object', () => {
    expect(obj instanceof LicenseGroup).toBe(true);
  });
  it('should create the software array from the config arg on construction', () => {
    expect(obj.software instanceof Array).toBe(true);
    expect(obj.software.length).toBe(5);
  });
});

describe('LicenseGroup: getActiveEntries', () => {
  it('should return array with three objects', () => {
    res = obj.getActiveEntries();
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(3);
    expect(res[0]).toHaveProperty('vendor');
    expect(res[0].vendor).toBe('Adobe');
    expect(res[0]).toHaveProperty('active');
    expect(res[0].active).toBe(true);
    expect(res[2]).toHaveProperty('vendor');
    expect(res[2].vendor).toBe('WidgetCo');
    expect(res[2]).toHaveProperty('active');
    expect(res[2].active).toBe(true);
  });
});

describe('LicenseGroup: getActiveVendors', () => {
  it('should return array with Adobe & WidgetCo as current active vendors', () => {
    res = obj.getActiveVendors();
    expect(res).toEqual(['Adobe', 'WidgetCo']);
  });
});

describe('LicenseGroup: getLicenseGroupsByVendor', () => {
  it('should return two adobe licenses from the app conf', () => {
    res = obj.getLicenseGroupsByVendor('Adobe');
    expect(res.length).toBe(2);
  });
  it('should return one WidgetCo license from the app conf', () => {
    res = obj.getLicenseGroupsByVendor('WidgetCo');
    expect(res.length).toBe(1);
  });
  it('should return zero SnarfCo licenses from the app conf', () => {
    res = obj.getLicenseGroupsByVendor('SnarfCo');
    expect(res.length).toBe(0);
  });
  it('should return zero licenses when active:false', () => {
    res = obj.getLicenseGroupsByVendor('FutureCo');
    expect(res.length).toBe(0);
  });
});

describe('LicenseGroup: getVendorGroupNamesByVendor', () => {
  it('should return two adobe licenses from the app conf', () => {
    res = obj.getVendorGroupNamesByVendor('Adobe');
    expect(res.length).toBe(2);
    expect(res[0]).toBe('Library Patron Photoshop api');
    expect(res[1]).toBe('Library Patron Illustrator api');
  });
  it('should return one WidgetCo license from the app conf', () => {
    res = obj.getVendorGroupNamesByVendor('WidgetCo');
    expect(res.length).toBe(1);
    expect(res[0]).toBe('WidgetGroup');
  });
});
