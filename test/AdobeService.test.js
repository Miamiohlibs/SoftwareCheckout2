const AdobeService = require('../classes/AdobeUserMgmtService');
const realConf = require('../config/adobe');
const serv = new AdobeService(realConf);
const testGroupName = 'Library API test';
const sampleGroupMembers = require('./sample-data/adobeGroupMembers');

describe('AdobeUserMmgtService: clearQueryConf()', () => {
  it('should have an empty queryConf object after running clearQueryConf', () => {
    serv.clearQueryConf();
    expect(serv.queryConf).toEqual({});
  });
  it('should have an empty queryConf object after running clearQueryConf', () => {
    serv.queryConf.url = 'https://bogus.com';
    serv.clearQueryConf();
    expect(serv.queryConf).toEqual({});
  });
});

describe('AdobeUserMmgtService: getNextUrl', () => {
  it('should correctly increment /0/ to /1/', () => {
    let url = 'https://adobe.io/usermanagement/groups/bogusId/0/';
    let intended = 'https://adobe.io/usermanagement/groups/bogusId/1/';
    let result = serv.getNextUrl(url);
    expect(result).toBe(intended);
  });
  it('should correctly increment /1/ to /2/', () => {
    let url = 'https://adobe.io/usermanagement/users/bogusId/1/';
    let intended = 'https://adobe.io/usermanagement/users/bogusId/2/';
    let result = serv.getNextUrl(url);
    expect(result).toBe(intended);
  });
});

describe('AdobeUserMmgtService: getEmailsFromGroupMembers()', () => {
  it('should read email addresses from response object', () => {
    let res = serv.getEmailsFromGroupMembers(sampleGroupMembers);
    let expected = ['bomholmm@miamioh.edu', 'irwinkr@miamioh.edu'];
    expect(res).toEqual(expected);
  });
});

describe('AdobeUserMmgtService: getGroupMembers()', () => {
  getPagSpy = jest.spyOn(serv, 'getPaginatedResults').mockImplementation(() => {
    return { users: ['testuser@fake.org'] };
  });

  it('should call getPaginatedResults with users', async () => {
    await serv.getGroupMembers(testGroupName);
    expect(getPagSpy).toHaveBeenCalledTimes(1);
  });
  it('should set a queryConf.url ending in the group name', async () => {
    await serv.getGroupMembers(testGroupName);
    let expectedMatch = new RegExp('/users/.*/0/' + testGroupName + '$');
    expect(serv.queryConf.url).toMatch(expectedMatch);
  });
});

describe('AdobeUserMmgtService: createAddJsonBody', () => {
  it('should create JSON body with action 1 from only two inputs', () => {
    let expected1 = {
      user: 'doejohn@test.edu',
      requestID: 'action_1',
      do: [
        {
          add: {
            group: 'Library API test',
          },
        },
      ],
    };
    let res = serv.createAddJsonBody('doejohn@test.edu', testGroupName);
    expect(res).toEqual(expected1);
  });
  it('should create JSON body with action 33 from three inputs', () => {
    let expected2 = {
      user: 'doejane@test.edu',
      requestID: 'action_33',
      do: [
        {
          add: {
            group: 'Library API test',
          },
        },
      ],
    };
    let res = serv.createAddJsonBody('doejane@test.edu', testGroupName, 33);
    expect(res).toEqual(expected2);
  });
});

describe('AdobeUserMmgtService: prepBulkAddUsers2AdobeGroup', () => {
  let emails = ['email1@test.org', 'email2@test.org', 'email3@test.org'];
  let res = serv.prepBulkAddUsers2AdobeGroup(emails, testGroupName);
  it('should get an array', () => {
    expect(res.length).toBe(3);
  });
  it('the first array item should be an object with user:email1@test.org and requestID:request_1', () => {
    expect(res[0].user).toBe('email1@test.org');
    expect(res[0].requestID).toBe('action_1');
  });
  it('the first array item should be an object with user:email3@test.org and requestID:request_3', () => {
    expect(res[2].user).toBe('email3@test.org');
    expect(res[2].requestID).toBe('action_3');
  });
});

describe('AdobeUserMmgtService: addMembersToGroup', () => {
  bulkAddSpy = jest.spyOn(serv, 'prepBulkAddUsers2AdobeGroup');
  querySpy = jest.spyOn(serv, 'submitActionReqs');
  serv.addMembersToGroup(
    ['johndoe@fake.org', 'janedoe@fake.org'],
    'fakegroupname'
  );
  it('should call prepBulkAddUsers2AdobeGroup once', () => {
    expect(bulkAddSpy).toHaveBeenCalledTimes(1);
  });
  it('should call getQueryResults once', () => {
    expect(querySpy).toHaveBeenCalledTimes(1);
  });
});
