const AdobeRepository = require('../../repositories/AdobeRepository');
const realConf = require('../../config/adobe');
const repo = new AdobeRepository(realConf);
const testGroupName = 'Library API test';
const sampleGroupMembers = require('./sample-data/adobeGroupMembers');

describe('AdobeRepository: clearQueryConf()', () => {
  it('should have an empty queryConf object after running clearQueryConf', () => {
    repo.clearQueryConf();
    expect(repo.queryConf).toEqual({});
  });
  it('should have an empty queryConf object after running clearQueryConf', () => {
    repo.queryConf.url = 'https://bogus.com';
    repo.clearQueryConf();
    expect(repo.queryConf).toEqual({});
  });
});

describe('AdobeRepository: getNextUrl', () => {
  it('should correctly increment /0/ to /1/', () => {
    let url = 'https://adobe.io/usermanagement/groups/bogusId/0/';
    let intended = 'https://adobe.io/usermanagement/groups/bogusId/1/';
    let result = repo.getNextUrl(url);
    expect(result).toBe(intended);
  });
  it('should correctly increment /1/ to /2/', () => {
    let url = 'https://adobe.io/usermanagement/users/bogusId/1/';
    let intended = 'https://adobe.io/usermanagement/users/bogusId/2/';
    let result = repo.getNextUrl(url);
    expect(result).toBe(intended);
  });
});

describe('AdobeRepository: getEmailsFromGroupMembers()', () => {
  it('should read email addresses from response object', () => {
    let res = repo.getEmailsFromGroupMembers(sampleGroupMembers);
    let expected = ['bomholmm@miamioh.edu', 'irwinkr@miamioh.edu'];
    expect(res).toEqual(expected);
  });
});

describe('AdobeRepository: getGroupMembers()', () => {
  getPagSpy = jest.spyOn(repo, 'getPaginatedResults').mockImplementation(() => {
    return { users: ['testuser@fake.org'] };
  });

  it('should call getPaginatedResults with users', async () => {
    await repo.getGroupMembers(testGroupName);
    expect(getPagSpy).toHaveBeenCalledTimes(1);
  });
  it('should set a queryConf.url ending in the group name', async () => {
    await repo.getGroupMembers(testGroupName);
    let expectedMatch = new RegExp('/users/.*/0/' + testGroupName + '$');
    expect(repo.queryConf.url).toMatch(expectedMatch);
  });
});

describe('AdobeRepository: createActionReqBody', () => {
  it('should create ADD body with action 1 from only three inputs', () => {
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
    let res = repo.createActionReqBody(
      'add',
      'doejohn@test.edu',
      testGroupName
    );
    expect(res).toEqual(expected1);
  });
  it('should create ADD body with action 33 from four inputs', () => {
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
    let res = repo.createActionReqBody(
      'add',
      'doejane@test.edu',
      testGroupName,
      33
    );
    expect(res).toEqual(expected2);
  });
  it('should create ADD body with action 1 from only three inputs', () => {
    let expected3 = {
      user: 'doejohn@test.edu',
      requestID: 'action_1',
      do: [
        {
          remove: {
            group: 'Library API test',
          },
        },
      ],
    };
    let res = repo.createActionReqBody(
      'remove',
      'doejohn@test.edu',
      testGroupName
    );
    expect(res).toEqual(expected3);
  });
});

describe('AdobeRepository: prepBulkGroupUsers (add)', () => {
  let emails = ['email1@test.org', 'email2@test.org', 'email3@test.org'];
  let res = repo.prepBulkGroupUsers('add', emails, testGroupName);
  it('should get an array', () => {
    expect(res.length).toBe(3);
  });
  it('the first array item should be an object with user:email1@test.org and requestID:request_1', () => {
    expect(res[0].user).toBe('email1@test.org');
    expect(res[0].requestID).toBe('action_1');
    expect(res[0]).toHaveProperty('do');
    expect(Array.isArray(res[0].do)).toBe(true);
    expect(res[0].do[0]).toHaveProperty('add');
  });
  it('the first array item should be an object with user:email3@test.org and requestID:request_3', () => {
    expect(res[2].user).toBe('email3@test.org');
    expect(res[2].requestID).toBe('action_3');
    expect(res[2]).toHaveProperty('do');
    expect(Array.isArray(res[2].do)).toBe(true);
    expect(res[2].do[0]).toHaveProperty('add');
  });
});

describe('AdobeRepository: alterGroupMembers (add)', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    prepSpy = jest.spyOn(repo, 'prepBulkGroupUsers').mockImplementation(() => {
      return [{ user: 'test' }];
    });
    setUrlSpy = jest.spyOn(repo, 'setActionUrl');
    querySpy = jest
      .spyOn(repo, 'submitActionReqs')
      .mockImplementation(() => Promise.resolve());
    repo.alterGroupMembers(
      'add',
      ['johndoe@fake.org', 'janedoe@fake.org'],
      'fakegroupname'
    );
  });
  it('should call prepBulkGroupUsers once', () => {
    expect(prepSpy).toHaveBeenCalledTimes(1);
  });
  it('should call setActionUrl once', () => {
    expect(setUrlSpy).toHaveBeenCalledTimes(1);
  });
  it('should call getQueryResults once', () => {
    expect(querySpy).toHaveBeenCalledTimes(1);
  });
});

describe('AdobeRepository: alterGroupMembers (remove)', () => {
  beforeAll(async () => {
    jest.resetAllMocks();
    prepSpy = jest.spyOn(repo, 'prepBulkGroupUsers').mockImplementation(() => {
      return [{ user: 'test' }];
    });
    setUrlSpy = jest.spyOn(repo, 'setActionUrl');
    querySpy = jest
      .spyOn(repo, 'submitActionReqs')
      .mockImplementation(() => Promise.resolve());
    repo.alterGroupMembers(
      'remove',
      ['johndoe@fake.org', 'janedoe@fake.org'],
      'fakegroupname'
    );
  });

  it('should call prepBulkGroupUsers once', () => {
    expect(prepSpy).toHaveBeenCalledTimes(1);
  });
  it('should call setActionUrl once', () => {
    expect(setUrlSpy).toHaveBeenCalledTimes(1);
  });
  it('should call getQueryResults once', () => {
    expect(querySpy).toHaveBeenCalledTimes(1);
  });
});

describe('AdobeRepository: addGroupMembers', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    alterSpy = jest
      .spyOn(repo, 'alterGroupMembers')
      .mockImplementation(() => Promise.resolve());
    emails = ['fakeemail@fake.org'];
  });

  it('should call alterGroupMembers with "add"', async () => {
    repo.addGroupMembers(emails, testGroupName);
    expect(alterSpy).toHaveBeenCalledWith('add', emails, testGroupName, null);
    expect(alterSpy).toHaveBeenCalledTimes(1);
  });
});

describe('AdobeRepository: removeGroupMembers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    alterSpy = jest
      .spyOn(repo, 'alterGroupMembers')
      .mockImplementation(() => Promise.resolve());
  });
  let emails = ['fakeemail@fake.org'];

  it('should call alterGroupMembers with "remove"', async () => {
    repo.removeGroupMembers(emails, testGroupName);
    expect(alterSpy).toHaveBeenCalledWith(
      'remove',
      emails,
      testGroupName,
      null
    );
    expect(alterSpy).toHaveBeenCalledTimes(1);
  });
});
