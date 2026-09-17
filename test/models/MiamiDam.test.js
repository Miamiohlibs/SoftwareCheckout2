// const realConf = require('../../config/miamiDam');
const fakeConf = require('./sample-data/miamiDamConf.js');
const MiamiDamApi = require('../../models/MiamiDamApi');

describe('Initialization', () => {
  const api = new MiamiDamApi(fakeConf);

  it('should initialize with a conf file', () => {
    expect(typeof api).toBe('object');
    expect(api).toHaveProperty('token');
    expect(api.token).toBe('12345'); // value from fakeConf
  });
});

describe('getAuthHeaders', () => {
  const api = new MiamiDamApi(fakeConf);

  it('should set the authHeaders', async () => {
    let authHeaders = api.getAuthHeaders();
    expect(typeof authHeaders).toBe('object');
    expect(authHeaders).toHaveProperty('Authorization');
    expect(authHeaders.Authorization).toMatch(/^Bearer 12345$/);
  });
});
