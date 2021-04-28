const realConf = require('../../config/adobe');
const AdobeUserMgmtApi = require('../../models/AdobeApi');
const AdobeRepo = require('../../repositories/AdobeRepository');
const api = new AdobeUserMgmtApi(realConf);
const repo = new AdobeRepo(realConf);
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
    res = await repo.getGroupMembers(testGroupName);
    expect(res.length).toEqual(2);
  });
});

describe('AdobeUserMgmtrepoice: addMembersToGroup', () => {
  emailsToAdd1 = ['qum@miamioh.edu'];
  emailsToAdd2 = ['qum@miamioh.edu', 'brownsj1@miamioh.edu'];
  emailsFake1 = ['thisissuchafakeemail@miamioh.edu'];
  emailsBigList = [
    'qum@miamioh.edu',
    'yarnete@miamioh.edu',
    'irwinkr@miamioh.edu',
    'hawkpf@miamioh.edu',
    'diebelsa@miamioh.edu',
    'brownsj1@miamioh.edu',
    'bomholmm@miamioh.edu',
    'kaiserj5@miamioh.edu',
    'calabrcm@miamioh.edu',
    'conleyj@miamioh.edu',
    'wegnera3@miamioh.edu',
  ];
  it('should be able to fake-add Meng to a list', async () => {
    let res = await repo.addGroupMembers(emailsToAdd1, testGroupName, 'test');
    expect(res).toHaveProperty('status');
    expect(res.status).toBe('success');
    expect(res).toHaveProperty('message');
    expect(res.message).toHaveProperty('completedInTestMode');
    expect(res.message.completedInTestMode).toBe(1);
  });
  it('should be able to fake-add two users to a list', async () => {
    let res = await repo.addGroupMembers(emailsToAdd2, testGroupName, 'test');
    expect(res).toHaveProperty('status');
    expect(res.status).toBe('success');
    expect(res).toHaveProperty('message');
    expect(res.message).toHaveProperty('completedInTestMode');
    expect(res.message.completedInTestMode).toBe(2);
  });
  it('should fail to fake-add fakeuser to a list', async () => {
    let res = await repo.addGroupMembers(emailsFake1, testGroupName, 'test');
    expect(res).toHaveProperty('status');
    expect(res.status).toBe('error');
    expect(res).toHaveProperty('message');
    expect(res.message).toHaveProperty('errors');
    expect(res.message).toHaveProperty('notCompleted');
    expect(res.message.notCompleted).toBe(1);
  });
  it('should be able to add more than 10 users at once (chunked into sep calls)', async () => {
    let res = await repo.addGroupMembers(emailsBigList, testGroupName, 'test');
    expect(res).toHaveProperty('status');
    expect(res.status).toBe('success');
    expect(res).toHaveProperty('message');
    expect(res.message).toHaveProperty('completedInTestMode');
    expect(res.message.completedInTestMode).toBe(11);
  });
});
