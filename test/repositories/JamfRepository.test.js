const demoData = require('./sample-data/jamfApiSubmission');
const fakeConf = require('./sample-data/jamfFakeConf');
const oneUser = ['userOne'];
const twoUsers = ['userOne', 'userTwo'];
const xmlMinify = require('minify-xml').minify;
const JamfRepo = require('../../repositories/JamfRepository');
const repo = new JamfRepo(fakeConf);
const usersNoSuffix = ['userOne', 'userTwo', 'userThree'];
const usersWithSuffix = [
  'userOne@fake.org',
  'userTwo@fake.org',
  'userThree@fake.org',
];
describe('JamfRepo: constructor', () => {
  it('should instantiate a JamfApi as this.api', () => {
    expect(repo).toHaveProperty('api');
    expect(repo.api).toHaveProperty('baseUrl');
    expect(repo.api).toHaveProperty('auth');
  });
});

describe('JamfRepo: generateUsersArray', () => {
  it('should generate a valid users array for one user', () => {
    let res = repo.generateUsersArray(oneUser);
    expect(res).toEqual(demoData.oneUser);
  });
  it('should generate a valid users array for two users', () => {
    let res = repo.generateUsersArray(twoUsers);
    expect(res).toEqual(demoData.twoUsers);
  });
});

describe('JamfRepo: generateAddOrDeleteXml', () => {
  it('should generate a valid add array for one user', () => {
    let res = repo.generateAddOrDeleteXml('add', oneUser);
    expect(xmlMinify(res)).toEqual(xmlMinify(demoData.oneUserAdd));
  });
  it('should generate a valid add array for two users', () => {
    let res = repo.generateAddOrDeleteXml('add', twoUsers);
    expect(xmlMinify(res)).toEqual(xmlMinify(demoData.twoUsersAdd));
  });
  it('should generate a valid delete array for one user', () => {
    let res = repo.generateAddOrDeleteXml('delete', oneUser);
    expect(xmlMinify(res)).toEqual(xmlMinify(demoData.oneUserDelete));
  });
  it('should generate a valid delete array for two users', () => {
    let res = repo.generateAddOrDeleteXml('delete', twoUsers);
    expect(xmlMinify(res)).toEqual(xmlMinify(demoData.twoUsersDelete));
  });
});

describe('JamfRepo: addUsersToGroup', () => {
  beforeAll(async () => {
    addSuffixSpy = jest.spyOn(repo, 'addEmailSuffixes');
    removeSuffixSpy = jest.spyOn(repo, 'removeEmailSuffixes');
    generateSpy = jest
      .spyOn(repo, 'generateAddOrDeleteXml')
      .mockImplementation(() => {
        return '<usergroups></usergroups>';
      });
    putSpy = jest.spyOn(repo.api, 'submitPut').mockImplementation(() => {
      return true;
    });
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    let res = repo.addUsersToGroup(1, ['userOne@fake.org']);
  });

  it('should call removeEmailSuffixes once', () => {
    expect(removeSuffixSpy).toHaveBeenCalledTimes(1);
    expect(removeSuffixSpy).toHaveBeenCalledWith(['userOne@fake.org']);
  });

  it('should call generateAddOrDeleteXml once', () => {
    expect(generateSpy).toHaveBeenCalledTimes(1);
    expect(generateSpy).toHaveBeenCalledWith('add', ['userOne']);
  });

  it('should call submitPut once', () => {
    let fakeXml = '<usergroups></usergroups>';
    let fakeUrl = 'https://myfakejamf.edu:8443/JSSResource/usergroups/id/1';
    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith(fakeUrl, fakeXml);
  });
});

describe('JamfRepo: removeUsersFromGroup', () => {
  // inherit spies from previous test block
  beforeEach(async () => {
    jest.clearAllMocks();
    let res = repo.deleteUsersFromGroup(1, ['userOne@fake.org']);
  });

  it('should call removeEmailSuffixes once', () => {
    expect(removeSuffixSpy).toHaveBeenCalledTimes(1);
    expect(removeSuffixSpy).toHaveBeenCalledWith(['userOne@fake.org']);
  });

  it('should call generateAddOrDeleteXml once', () => {
    expect(generateSpy).toHaveBeenCalledTimes(1);
    expect(generateSpy).toHaveBeenCalledWith('delete', ['userOne']);
  });

  it('should call submitPut once', () => {
    let fakeXml = '<usergroups></usergroups>';
    let fakeUrl = 'https://myfakejamf.edu:8443/JSSResource/usergroups/id/1';
    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith(fakeUrl, fakeXml);
  });
});

describe('JamfRepo: addEmailSuffix', () => {
  it('should add the suffix "@fake.org" a single user', () => {
    let res = repo.addEmailSuffix('mpython');
    expect(res).toEqual('mpython@fake.org');
  });
});

describe('JamfRepo: removeEmailSuffix', () => {
  it('should remove the suffix "@fake.org" from a single user', () => {
    let res = repo.removeEmailSuffix('mpython@fake.org');
    expect(res).toEqual('mpython');
  });
});

describe('JamfRepo: addEmailSuffixes', () => {
  it('should add the suffix "@fake.org" to each user in array', () => {
    let res = repo.addEmailSuffixes(usersNoSuffix);
    expect(res).toEqual(usersWithSuffix);
  });
});

describe('JamfRepo: removeEmailSuffixes', () => {
  it('should remove the suffix "@fake.org" from each user in array', () => {
    let res = repo.removeEmailSuffixes(usersWithSuffix);
    expect(res).toEqual(usersNoSuffix);
  });
});

describe('JamfRepo: generateCreateUserXML', () => {
  it('should generate a valid XML submission for one user', () => {
    let res = repo.generateCreateUserXML('fakeUserId', 'Mx. Fake User Name');
    expect(xmlMinify(res)).toEqual(xmlMinify(demoData.createUser));
  });
});
