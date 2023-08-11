const Anon = require('../../models/StatsAnonymizer');
let tempSecret = 'this is a fake secret';
const anon = new Anon(tempSecret);

describe('constructor', () => {
  it('should set secret to tempSecret', () => {
    expect(anon.secret).toBe(tempSecret);
  });
});

describe('anonymizeString', () => {
  it('should convert kaylee@firefly.com to hash', () => {
    let res = anon.anonymizeString('kaylee@firefly.com');
    expect(res).toBe('15aa8066a8495ffb6b9e5f9c8f470dc2');
  });
  it('should convert Kaywinnet Lee to hash', () => {
    let res = anon.anonymizeString('Kaywinnet Lee');
    expect(res).toBe('f4f84e8f854888041415d7d94702cf2f');
  });
  it('should convert Frye to hash', () => {
    let res = anon.anonymizeString('Frye');
    expect(res).toBe('193898e4896bc4b21195c1b67b561309');
  });
});

describe('anonymizeObject', () => {
  it('should convert an object to an object with anonymized values for given fields', () => {
    let obj = {
      firstName: 'Kaywinnet Lee',
      lastName: 'Frye',
      bookId: 'cs5q0LpSx',
      product: 'Adobe Creative Cloud',
    };
    let desired = {
      firstName: 'f4f84e8f854888041415d7d94702cf2f',
      lastName: '193898e4896bc4b21195c1b67b561309',
      bookId: 'cs5q0LpSx',
      product: 'Adobe Creative Cloud',
    };
    let res = anon.anonymizeObject(obj, ['firstName', 'lastName']);
    expect(res).toEqual(desired);
  });
});

describe('anonymizeArray', () => {
  it('should convert an array of objects to an array of objects with anonymized values for given fields', () => {
    const anonFields = ['firstName', 'lastName', 'email', 'account'];
    const input = require('./sample-data/nonAnonData');
    const desired = require('./sample-data/anonData');
    const res = anon.anonymizeArray(input, anonFields);
    expect(res).toEqual(desired);
  });
});
