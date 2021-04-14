const appConfMixed = require('./sample-data/appConfSample');
const LicenseGroup = require('../classes/LicenseGroup');
const obj = new LicenseGroup(appConfMixed);

describe('initialization', () => {
  it('should initialize as a LicenseGroup object', () => {
    expect(obj instanceof LicenseGroup).toBe(true);
  });
  it('should create the software array from the config arg on constrution', () => {
    expect(obj.software instanceof Array).toBe(true);
    expect(obj.software.length).toBe(3);
  });
});
describe('getLicenseGroupsByVendor', () => {
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
});

describe('getVendorGroupNamesByVendor', () => {
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
