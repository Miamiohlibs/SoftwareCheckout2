const realConf = require('../config/adobe');
const AdobeUserMgmtApi = require('../classes/AdobeUserMgmtApi');
const api = new AdobeUserMgmtApi(realConf);
const testGroupName = 'Library API test';

describe('AdobeUserMgmtApi: getToken', () => {
  it('should get an accessToken', async () => {
    await api.getToken();
    expect(typeof api.accessToken).toBe('string');
    expect(api.accessToken.length).toBeGreaterThan(200);
  });
});

describe('AdobeUserMgmtApi: getGroupMembers', () => {
  it('should find two members of the test group', async () => {
    // await api.getToken();
    res = await api.getGroupMembers(testGroupName);
    expect(res.length).toEqual(2);
  });
});

describe('AdobeUserMgmtApi: addMembersToGroup (these now fail because the fn no longer returns a value)', () => {
  emailsToAdd1 = ['qum@miamioh.edu'];
  emailsToAdd2 = ['qum@miamioh.edu', 'brownsj1@miamioh.edu'];
  it('should be able to fake-add Meng to a list', async () => {
    let res = await api.addMembersToGroup(emailsToAdd1, testGroupName, 'test');
    expect(res).toHaveProperty('completedInTestMode');
    expect(res.completedInTestMode).toBe(1);
  });
  it('should be able to fake-add two users to a list', async () => {
    let res = await api.addMembersToGroup(emailsToAdd2, testGroupName, 'test');
    expect(res).toHaveProperty('completedInTestMode');
    expect(res.completedInTestMode).toBe(2);
  });
});
