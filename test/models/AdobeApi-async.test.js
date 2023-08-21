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

// this test requires having a current group with two members set up
// set up group and uncomment it to run test
// describe('AdobeUserMgmtApi: getGroupMembers', () => {
//   it('should find two members of the test group', async () => {
//     // await api.getToken();
//     res = await repo.getGroupMembers(testGroupName);
//     expect(res.length).toEqual(2);
//   });
// });

describe('AdobeUserMgmtRepository: addMembersToGroup', () => {
  emailsToAdd1 = ['qum@miamioh.edu'];
  emailsToAdd2 = ['qum@miamioh.edu', 'brownsj1@miamioh.edu'];
  emailsFake1 = ['thisissuchafakeemail@miamioh.edu'];
  emailsBigList = [
    'qum@miamioh.edu',
    'yarnete@miamioh.edu',
    'irwinkr@miamioh.edu',
    'maderir@miamioh.edu',
    'kerre2@miamioh.edu',
    'brownsj1@miamioh.edu',
    'bomholmm@miamioh.edu',
    'wisnesr@miamioh.edu',
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

  // if this test is failing, it may be because this test suite is running too fast
  // and hitting the rate limit on the Adobe API
  // if that happens, comment out the preceding tests (but the sleep command ought to prevent this problem)
  it('should be able to add more than 10 users at once (chunked into sep calls)', async () => {
    // sleep 3000ms to avoid rate limit
    await new Promise((r) => setTimeout(r, 3000));
    let res = await repo.addGroupMembers(emailsBigList, testGroupName, 'test');
    expect(res).toHaveProperty('status');
    expect(res.status).toBe('success');
    expect(res).toHaveProperty('message');
    expect(res.message).toHaveProperty('completedInTestMode');
    let expectedLength = emailsBigList.length;
    expect(res.message.completedInTestMode).toBe(expectedLength);
  }, 8000); // 8000 is a timeout in ms
});
