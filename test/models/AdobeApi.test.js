// const appConfMissingStuff = require('./sample-data/appConfSample');
const realConf = require('../../config/adobe');
const AdobeUserMgmtApi = require('../../models/AdobeApi');

// const bookingsToAdd = require('./sample-data/libCalBookingsToAdd2Adobe');

describe('Initialization', () => {
  api = new AdobeUserMgmtApi(realConf);

  it('should initialize with a conf file', () => {
    expect(typeof api.credentials).toBe('object');
    expect(api.credentials).toHaveProperty('clientId');
  });
});

describe('getAuthHeaders', () => {
  it('should set the authHeaders', async () => {
    api.accessToken = 'thisisafaketoken';
    let authHeaders = api.getAuthHeaders();
    expect(typeof authHeaders).toBe('object');
    expect(authHeaders).toHaveProperty('x-api-key');
    expect(authHeaders['x-api-key']).toBe(api.credentials.clientId);
    expect(authHeaders).toHaveProperty('Authorization');
    expect(authHeaders.Authorization).toMatch(/^Bearer thisisafaketoken$/);
  });
});
