const JamfApi = require('../../models/JamfApi');
require('jest-xml-matcher');
const demoData = require('./sample-data/jamfApiSubmission');
const fakeConf = require('./sample-data/jamfFakeConf');
const fakeApi = new JamfApi(fakeConf);
const oneUser = ['userOne'];
const twoUsers = ['userOne', 'userTwo'];
const xmlMinify = require('minify-xml').minify;

describe('JamfApi: constructor', () => {
  it('should load auth on initialization', () => {
    expect(fakeApi).toHaveProperty('auth');
    expect(fakeApi.auth).toHaveProperty('username');
    expect(fakeApi.auth.username).toBe('jamfuser');
    expect(fakeApi).toHaveProperty('baseUrl');
  });
  it('should create a baseUrl', () => {
    expect(fakeApi.baseUrl).toBe('https://myfakejamf.edu:8443/JSSResource');
  });
});

describe('JamfApi: generateUsersArray', () => {
  it('should generate a valid users array for one user', () => {
    let res = fakeApi.generateUsersArray(oneUser);
    expect(res).toEqual(demoData.oneUser);
  });
  it('should generate a valid users array for two users', () => {
    let res = fakeApi.generateUsersArray(twoUsers);
    expect(res).toEqual(demoData.twoUsers);
  });
});

describe('JamfApi: generateAddOrDeleteXml', () => {
  it('should generate a valid add array for one user', () => {
    let res = fakeApi.generateAddOrDeleteXml('add', oneUser);
    expect(xmlMinify(res)).toEqual(xmlMinify(demoData.oneUserAdd));
  });
  it('should generate a valid add array for two users', () => {
    let res = fakeApi.generateAddOrDeleteXml('add', twoUsers);
    expect(xmlMinify(res)).toEqual(xmlMinify(demoData.twoUsersAdd));
  });
  it('should generate a valid delete array for one user', () => {
    let res = fakeApi.generateAddOrDeleteXml('delete', oneUser);
    expect(xmlMinify(res)).toEqual(xmlMinify(demoData.oneUserDelete));
  });
  it('should generate a valid delete array for two users', () => {
    let res = fakeApi.generateAddOrDeleteXml('delete', twoUsers);
    expect(xmlMinify(res)).toEqual(xmlMinify(demoData.twoUsersDelete));
  });
});
