const JamfApi = require('../../models/JamfApi');
const fakeConf = require('./sample-data/jamfFakeConf');
const fakeApi = new JamfApi(fakeConf);

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
