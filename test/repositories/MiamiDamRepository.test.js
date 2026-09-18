const { beforeEach } = require('node:test');
const MiamiDamRepository = require('../../repositories/MiamiDamRepository');
const fakeConf = require('../sample-data/miamiDamConf');
const { uniqueId } = require('lodash');
const { query } = require('winston');

describe('MiamiDamRepository', () => {
  beforeEach(() => {});
  it('should initialize with a baseUrl', () => {
    const repo = new MiamiDamRepository(fakeConf);

    expect(repo).toHaveProperty('baseUrl');
    expect(repo.baseUrl).toBe('https://fake.org/api');
  });
});

describe('MiamiDamRepository.getGroupMembers', () => {
  const repo = new MiamiDamRepository(fakeConf);

  it('should call getQueryResults with the correct url and method', async () => {
    const querySpy = jest.spyOn(repo.api, 'getQueryResults').mockResolvedValue({
      data: { success: true },
    });
    const res = await repo.getGroupMembers('test-group');
    expect(querySpy).toHaveBeenCalledWith({
      method: 'get',
      url: 'https://fake.org/api/members/test-group',
    });
  });
});

describe('MiamiDamRepository.getOneGroupMember', () => {
  const repo = new MiamiDamRepository(fakeConf);

  it('should call getQueryResults with the correct url and method', async () => {
    const querySpy = jest.spyOn(repo.api, 'getQueryResults').mockResolvedValue({
      data: { success: true },
    });
    const res = await repo.getOneGroupMember('test-group', 'fakeuser');
    expect(querySpy).toHaveBeenCalledWith({
      method: 'get',
      url: 'https://fake.org/api/members/test-group/fakeuser',
    });
  });
});

describe('addGroupMember', () => {
  const repo = new MiamiDamRepository(fakeConf);

  it('should call the correct endpoint with the fakeuser as data payload', async () => {
    const querySpy = jest.spyOn(repo.api, 'getQueryResults').mockResolvedValue({
      data: { success: true },
    });
    const res = await repo.addGroupMember('test-group', 'fakeuser');
    expect(querySpy).toHaveBeenCalledWith({
      method: 'post',
      url: 'https://fake.org/api/members/test-group',
      data: { uniqueId: 'fakeuser' },
    });
  });
});

describe('addGroupMembers', () => {
  const repo = new MiamiDamRepository(fakeConf);
  const fakeUserList = ['user1', 'user2', 'user3'];
  it('should call addGroupMember three times', async () => {
    const querySpy = jest
      .spyOn(repo, 'addGroupMember')
      .mockImplementation(() => Promise.resolve());
    const res = await repo.addGroupMembers('test-group', fakeUserList);
    expect(querySpy).toHaveBeenCalledTimes(3);
    expect(querySpy).toHaveBeenCalledWith('test-group', 'user1');
    expect(querySpy).toHaveBeenCalledWith('test-group', 'user2');
    expect(querySpy).toHaveBeenCalledWith('test-group', 'user3');
  });
});

describe('removeGroupMember', () => {
  const repo = new MiamiDamRepository(fakeConf);
  it('should call the correct endpoint with group name and memberId', async () => {
    const querySpy = jest.spyOn(repo.api, 'getQueryResults').mockResolvedValue({
      data: { success: true },
    });
    const res = await repo.removeGroupMember('test-group', 'fakeuser');
    expect(querySpy).toHaveBeenCalledWith({
      method: 'delete',
      url: 'https://fake.org/api/members/test-group/fakeuser',
    });
  });
});

describe('removeGroupMembers', () => {
  const repo = new MiamiDamRepository(fakeConf);
  const fakeUserList = ['user1', 'user2', 'user3'];
  it('should call addGroupMember three times', async () => {
    const querySpy = jest
      .spyOn(repo, 'removeGroupMember')
      .mockImplementation(() => Promise.resolve());
    const res = await repo.removeGroupMembers('test-group', fakeUserList);
    expect(querySpy).toHaveBeenCalledTimes(3);
    expect(querySpy).toHaveBeenCalledWith('test-group', 'user1');
    expect(querySpy).toHaveBeenCalledWith('test-group', 'user2');
    expect(querySpy).toHaveBeenCalledWith('test-group', 'user3');
  });
});

describe('getEmailsFromGroupMembers', () => {
  const repo = new MiamiDamRepository(fakeConf);
  const groupMembers = require('./sample-data/miamiGroupResponse');
  const emails = repo.getEmailsFromGroupMembers(groupMembers);
  expect(emails).toEqual(['irwinkr@fake.org', 'bomholmm@fake.org']);
});
