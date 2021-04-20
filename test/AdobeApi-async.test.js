const realConf = require('../config/adobe');
const AdobeUserMgmtApi = require('../classes/AdobeUserMgmtApi');
const obj = new AdobeUserMgmtApi(realConf);

const testGroupName = 'Library API test';

describe('AdobeUserMgmtApi: getToken', () => {
  it('should get an accessToken', async () => {
    await obj.getToken();
    expect(typeof obj.accessToken).toBe('string');
    expect(obj.accessToken.length).toBeGreaterThan(200);
  });
});

describe('AdobeUserMgmtApi: getGroupMembers', () => {
  it('should find two members of the test group', async () => {
    // await obj.getToken();
    res = await obj.getGroupMembers(testGroupName);
    expect(res.length).toEqual(2);
  });
});
