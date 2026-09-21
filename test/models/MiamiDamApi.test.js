// const realConf = require('../../config/miamiDam');
const axios = require('axios');
const fakeConf = require('../sample-data/miamiDamConf.js');
const MiamiDamApi = require('../../models/MiamiDamApi.js');

describe('Initialization', () => {
  const api = new MiamiDamApi(fakeConf);

  it('should initialize with a conf file', () => {
    expect(typeof api).toBe('object');
    expect(api).toHaveProperty('token');
    expect(api.token).toBe('12345'); // value from fakeConf
    expect(api).toHaveProperty('baseUrl');
    expect(api.baseUrl).toBe('https://fake.org/api'); // value from fakeConf
  });
});

describe('getAuthHeaders', () => {
  const api = new MiamiDamApi(fakeConf);

  it('should set the authHeaders', () => {
    let authHeaders = api.getAuthHeaders();
    expect(typeof authHeaders).toBe('object');
    expect(authHeaders).toHaveProperty('Authorization');
    expect(authHeaders.Authorization).toMatch(/^Bearer 12345$/);
  });
});

describe('getQueryResults', () => {
  const api = new MiamiDamApi(fakeConf);
  const queryConf = {
    method: 'get',
    url: 'https://fake.org/api/members/grp-gemini',
  };
  it('should mock-get list members', async () => {
    const axiosSpy = jest.spyOn(axios, 'request').mockResolvedValue({
      status: 200,
      statusText: 'OK',
      data: { success: true },
      headers: {},
      config: {},
    });
    await api.getQueryResults(queryConf);
    expect(axiosSpy).toHaveBeenCalledWith({
      method: 'get',
      url: 'https://fake.org/api/members/grp-gemini',
      headers: {
        Authorization: 'Bearer 12345',
      },
    });
    axiosSpy.mockRestore();
  });
});
