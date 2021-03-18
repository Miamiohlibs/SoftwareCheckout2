const appConfMissingStuff = require('./sample-data/appConfSample');
const realConf = require('../config/adobe');
const AdobeUserMgmtApi = require('../classes/AdobeUserMgmtApi');
const sampleGroupMembers = require('./sample-data/adobeGroupMembers');
const bookingsToAdd = require('./sample-data/libCalBookingsToAdd2Adobe');

describe('Initialization', () => {
  beforeEach(() => {
    api = new AdobeUserMgmtApi(realConf);
  });

  it('should initialize with a conf file', () => {
    expect(typeof api.credentials).toBe('object');
    expect(api.credentials).toHaveProperty('clientId');
  });

  it('should be able to read the private key', () => {
    expect(api.credentials).toHaveProperty('privateKey');
    expect(typeof api.credentials.privateKey).toBe('string');
  });
});

describe('getAdobeLists', () => {
  beforeEach(() => {
    api = new AdobeUserMgmtApi(realConf);
  });

  it('should return only one object from the Mixed sample conf: Adobe Photoshop', () => {
    const response = api.getAdobeLists(appConfMissingStuff.softwareMixed);
    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('groups');
    expect(response).toHaveProperty('errors');
    expect(response.groups).toBeInstanceOf(Array);
    expect(response.groups.length).toBe(1);
    expect(response.errors).toBeInstanceOf(Array);
    expect(response.errors.length).toBe(2);
    expect(response.groups[0]).toHaveProperty('name', 'Adobe Photoshop');
  });

  it('should return two objects and no errors from the Good sample conf', () => {
    const response = api.getAdobeLists(appConfMissingStuff.softwareAllGood);
    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('groups');
    expect(response).not.toHaveProperty('errors');
    expect(response.groups).toBeInstanceOf(Array);
    expect(response.groups.length).toBe(2);
    expect(response.groups[0]).toHaveProperty('name', 'Adobe Photoshop');
    expect(response.groups[1]).toHaveProperty('name', 'Adobe Illustrator');
  });
});

describe('Queries', () => {
  beforeEach(async () => {
    api = new AdobeUserMgmtApi(realConf);
    await api.getToken();
  });

  it('should get the access token', () => {
    expect(api).toHaveProperty('accessToken');
    expect(typeof api.accessToken).toBe('string');
  });

  it('should add Auth and x-api-key headers using querySetup("generic") with no other arguments', () => {
    var genericOpts = api.queryConf.generic.options;
    const originalHeadersLength = Object.keys(genericOpts.headers).length;
    api.querySetup('generic');
    expect(api.currOpts).toHaveProperty('headers');
    expect(Object.keys(api.currOpts.headers).length).toEqual(
      originalHeadersLength + 2
    );
    expect(api.currOpts.headers).toHaveProperty('x-api-key');
    expect(api.currOpts.headers).toHaveProperty('Authorization');
    let firstWord = api.currOpts.headers.Authorization.split(' ')[0];
    expect(firstWord).toBe('Bearer');
  });

  it('should add Auth and x-api-key headers using querySetup() with extra arguments', () => {
    var genericOpts = api.queryConf.generic.options;
    const originalHeadersLength = Object.keys(genericOpts.headers).length;
    api.querySetup('generic', { fake: 'aardvark', bogus: 'pangolin' });
    expect(api.currOpts).toHaveProperty('fake', 'aardvark');
    expect(api.currOpts).toHaveProperty('bogus', 'pangolin');
    expect(Object.keys(api.currOpts.headers).length).toEqual(
      originalHeadersLength + 2
    );
  });

  it('should be able to add queryConfigs using querySetup() with extra headers', () => {
    var genericOpts = api.queryConf.generic.options;
    console.log('genericOpts', genericOpts);
    const originalHeadersLength = Object.keys(genericOpts.headers).length;
    api.querySetup('generic', {
      fake: 'aardvark',
      bogus: 'pangolin',
      headers: { artificial: 'imaginary' },
    });
    expect(api.currOpts).toHaveProperty('fake', 'aardvark');
    expect(api.currOpts).toHaveProperty('bogus', 'pangolin');
    expect(api.currOpts.headers).toHaveProperty('artificial', 'imaginary');
    expect(Object.keys(api.currOpts.headers).length).toEqual(
      originalHeadersLength + 3
    );
  });
});

describe('getActionPath', () => {
  beforeEach(async () => {
    api = new AdobeUserMgmtApi(realConf);
  });
  it('should return a valid path with just an action argument', () => {
    let response = api.getActionPath('users');
    let expected = expect.stringMatching(
      /^\/v2\/usermanagement\/users\/.*@AdobeOrg\/0\?/
    );
    expect(response).toEqual(expected);
  });

  it('should return a valid path with args: action, argument', () => {
    let response = api.getActionPath('users', 'myarg');
    let expected = expect.stringMatching(
      /^\/v2\/usermanagement\/users\/.*@AdobeOrg\/0\/myarg\?/
    );
    expect(response).toEqual(expected);
  });

  it('should return a valid path with args: action, argument, page', () => {
    let response = api.getActionPath('users', 'myarg', 2);
    let expected = expect.stringMatching(
      /^\/v2\/usermanagement\/users\/.*@AdobeOrg\/2\/myarg\?/
    );
    expect(response).toEqual(expected);
  });

  it('should return a valid path with args: action, null, page', () => {
    let response = api.getActionPath('users', null, 2);
    let expected = expect.stringMatching(
      /^\/v2\/usermanagement\/users\/.*@AdobeOrg\/2\?/
    );
    expect(response).toEqual(expected);
  });

  it('should return a valid path with args: action, argument, null', () => {
    let response = api.getActionPath('users', 'myarg', null);
    let expected = expect.stringMatching(
      /^\/v2\/usermanagement\/users\/.*@AdobeOrg\/0\/myarg\?/
    );
    expect(response).toEqual(expected);
  });

  it('should not paginate where action == action', () => {
    let response = api.getActionPath('action');
    let expected = expect.stringMatching(
      /^\/v2\/usermanagement\/action\/.*@AdobeOrg\/\?/
    );
    expect(response).toEqual(expected);
  });

  it('should throw an error with no args', () => {
    function noArgs() {
      api.getActionPath();
    }
    expect(noArgs).toThrowError(Error);
  });

  it('should return an error with non-integer page arg', () => {
    function hamsterMany() {
      api.getActionPath('generic', null, 'hamster');
    }
    expect(hamsterMany).toThrowError(Error);
  });
});

// This test uses live data and is only correct when we've set up a list to match its output
// Not useful for testing most of the time
// If you want to test this function, set the "expect response toBe" line to the expected value

// describe('getCurrentUsernames', () => {
//   beforeEach(async () => {
//     api = new AdobeUserMgmtApi(realConf);
//     await api.getToken();
//   });
//   it('should just get one username back', () => {
//     response = api.getCurrentUsernames(sampleGroupMembers);
//     expect(response).toBeInstanceOf(Array);
//     expect(response.length).toBe(1);
//     expect(response).toBe('irwinkr');
//   });
// });

describe('filterBookingsToAdd', () => {
  api = new AdobeUserMgmtApi(realConf);
  let remaining = api.filterBookingsToAdd(bookingsToAdd, [
    'bogususer@miamioh.edu',
  ]);
  expect(remaining).toBeInstanceOf(Array);
  expect(remaining.length).toBe(1);
  expect(remaining[0].email).toBe('fakeuser@miamioh.edu');
});

describe('filterUsersToRevoke', () => {
  api = new AdobeUserMgmtApi(realConf);
  let libCalList = ['user1@gmail.com', 'user2@gmail.com'];
  let adobeList = ['user1@gmail.com', 'user2@gmail.com', 'user3@gmail.com'];
  let revokeList = api.filterUsersToRevoke(libCalList, adobeList);
  expect(revokeList).toBeInstanceOf(Array);
  expect(revokeList.length).toBe(1);
  expect(revokeList[0]).toBe('user3@gmail.com');
});

describe('createAddJsonBody', () => {
  beforeEach(async () => {
    api = new AdobeUserMgmtApi(realConf);
    response = api.createAddJsonBody(
      'fakeuser@miamioh.edu',
      'US',
      'Fake',
      'User',
      ['fake user group1', 'fake group 2']
    );
  });
  it('should build an object with createFederatedId and add functions', () => {
    expect(typeof response).toBe('object');
    expect(response.user).toBe('fakeuser@miamioh.edu');
    expect(response.requestID).toBe('action_1');
    expect(response.do).toBeInstanceOf(Array);
    expect(response.do[0]).toHaveProperty('add');
  });

  it('should give "add" the apprpriate fields', () => {
    expect(response.do[0].add).toHaveProperty('group');
    expect(response.do[0].add.group).toBeInstanceOf(Array);
    expect(response.do[0].add.group[0]).toBe('fake user group1');
    expect(response.do[0].add.group[1]).toBe('fake group 2');
  });
});

describe('createRevokeJsonBody', () => {
  beforeEach(async () => {
    api = new AdobeUserMgmtApi(realConf);
    response = api.createRevokeJsonBody(
      'fakeuser@miamioh.edu',
      ['fake user group1', 'fake group 2'],
      1000
    );
  });
  it('should build an object with remove functions', () => {
    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('user', 'fakeuser@miamioh.edu');
    expect(response).toHaveProperty('requestID', 'revoke_1000');
    expect(response).toHaveProperty('do');
  });
  it('should have the appropriate structure in the "do" property', () => {
    expect(response.do).toBeInstanceOf(Array);
    expect(response.do.length).toBe(1);
    expect(response.do[0]).toHaveProperty('remove');
    expect(response.do[0].remove).toHaveProperty('group');
    expect(response.do[0].remove.group).toBeInstanceOf(Array);
    expect(response.do[0].remove.group[0]).toBe('fake user group1');
    expect(response.do[0].remove.group[1]).toBe('fake group 2');
  });
});

describe('prepBulkAddFromLibCal2Adobe', () => {
  beforeEach(() => {
    api = new AdobeUserMgmtApi(realConf);
    response = api.prepBulkAddFromLibCal2Adobe(bookingsToAdd);
  });

  it('should bring back an array of two to-dos for two people', () => {
    expect(response).toBeInstanceOf(Array);
    expect(typeof response[0]).toBe('object');
    expect(response.length).toBe(2);
    expect(response[0]).toHaveProperty('user', 'fakeuser@miamioh.edu');
    expect(response[1]).toHaveProperty('user', 'bogususer@miamioh.edu');
  });
});

describe('prepBulkRevokeFromAdobe', () => {
  beforeEach(() => {
    api = new AdobeUserMgmtApi(realConf);
    let userList = ['fakeuser@miamioh.edu', 'bogususer@miamioh.edu'];
    let listName = 'test list';
    response = api.prepBulkRevokeFromAdobe(userList, listName);
  });
  it('should return an array of revoke requests for two people', () => {
    expect(response).toBeInstanceOf(Array);
    expect(response.length).toBe(2);
    expect(response[0]).toHaveProperty('user', 'fakeuser@miamioh.edu');
    expect(response[1]).toHaveProperty('user', 'bogususer@miamioh.edu');
  });
});
