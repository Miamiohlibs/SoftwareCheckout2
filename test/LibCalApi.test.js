const fakeConf = require('./sample-data/libCalFakeConf');
const LibCalApi = require('../classes/LibCalApi');
const badConf = require('./sample-data/libCalBadConf');
const { JsonWebTokenError } = require('jsonwebtoken');
const api = new LibCalApi(fakeConf);
const axios = require('axios');
jest.mock('axios');

describe('LibCalApi: initialization', () => {
  it('should set a baseUrl upon initialization', () => {
    expect(api).toHaveProperty('baseUrl');
    expect(api.baseUrl).toBe('https://mylib.libcal.com/1.1/equipment/');
  });
  it('should throw an error if a required config element is missing', () => {
    expect(() => {
      new LibCalApi(badConf);
    }).toThrow('LibCalApi missing required property: softwareLocation');
  });
});

describe('LibCalApi: clearQueryConf', () => {
  it('should turn the queryConf into an empty object', () => {
    api.queryConf = {
      url: 'http://fakeurl.org',
      method: 'get',
    };
    api.clearQueryConf();
    expect(api.queryConf).toEqual({});
  });
});

describe('LibCalApi: getAuthHeaders', () => {
  it('should create the Auth/Bearer token', () => {
    api.accessToken = 'myFakeToken';
    let res = api.getAuthHeaders();
    expect(res).toEqual({
      Authorization: 'Bearer myFakeToken',
    });
    console.log(api);
    delete api.accessToken;
  });
  q;
});

describe('LibCalApi: getQueryResults', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.queryConf = {};
    tokenSpy = jest.spyOn(api, 'getToken').mockImplementation(() => {
      api.accessToken = 'myFakeToken';
    });
    headerSpy = jest.spyOn(api, 'getAuthHeaders').mockImplementation(() => {
      return { Authorization: `Bearer ${api.accessToken}` };
    });
    axios.request.mockImplementation(() =>
      Promise.resolve({ data: { bogus: 'data' } })
    );
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should get the access token once', async () => {
    await api.getQueryResults();
    expect(tokenSpy).toHaveBeenCalledTimes(1);
  });
  it('should get the auth headers once', async () => {
    await api.getQueryResults();
    expect(headerSpy).toHaveBeenCalledTimes(1);
  });
  it('should call axios once', async () => {
    await api.getQueryResults();
    expect(axios.request).toHaveBeenCalledTimes(1);
  });
});

describe('LibCalApi: getSoftwareCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQuerySpy = jest.spyOn(api, 'clearQueryConf');
    querySpy = jest.spyOn(api, 'getQueryResults').mockImplementation(() => {
      return [];
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should clear the queryConf', async () => {
    await api.getSoftwareCategories();
    expect(clearQuerySpy).toHaveBeenCalledTimes(1);
  });
  it('should set the query method = get', async () => {
    await api.getSoftwareCategories();
    expect(api.queryConf.method).toBe('get');
  });
  it('should set the url correctly', async () => {
    await api.getSoftwareCategories();
    expect(api.queryConf.url).toBe(
      'https://mylib.libcal.com/1.1/equipment/categories/1234'
    );
  });
  it('should execute the query', async () => {
    await api.getSoftwareCategories();
    expect(querySpy).toHaveBeenCalledTimes(1);
  });
});

describe('LibCalApi: getBookings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearQuerySpy = jest.spyOn(api, 'clearQueryConf');
    querySpy = jest.spyOn(api, 'getQueryResults').mockImplementation(() => {
      Promise.resolve({ data: { bogus: 'data' } });
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should clear the queryConf', async () => {
    await api.getBookings('789');
    expect(clearQuerySpy).toHaveBeenCalledTimes(1);
  });
  it('should set the query method = get', async () => {
    await api.getBookings('789');
    expect(api.queryConf.method).toBe('get');
  });
  it('should set the url correctly', async () => {
    await api.getBookings('789');
    expect(api.queryConf.url).toBe(
      'https://mylib.libcal.com/1.1/equipment/bookings/?limit=500&lid=1234&cid=789'
    );
  });
  it('should execute the query', async () => {
    await api.getBookings('789');
    expect(querySpy).toHaveBeenCalledTimes(1);
  });
});
