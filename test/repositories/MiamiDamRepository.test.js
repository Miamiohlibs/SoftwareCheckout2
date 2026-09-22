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
    const res = await repo.getOneGroupMember('fakeuser', 'test-group');
    expect(querySpy).toHaveBeenCalledWith({
      method: 'get',
      url: 'https://fake.org/api/members/test-group/fakeuser',
    });
  });
});

describe('addOneGroupMember', () => {
  const repo = new MiamiDamRepository(fakeConf);

  it('should call the correct endpoint with the fakeuser as data payload', async () => {
    const querySpy = jest.spyOn(repo.api, 'getQueryResults').mockResolvedValue({
      data: { success: true },
    });
    const res = await repo.addOneGroupMember('fakeuser', 'test-group');
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
  it('should call addOneGroupMember three times', async () => {
    const querySpy = jest
      .spyOn(repo, 'addOneGroupMember')
      .mockImplementation(() => Promise.resolve());
    const res = await repo.addGroupMembers(fakeUserList, 'test-group');
    expect(querySpy).toHaveBeenCalledTimes(3);
    expect(querySpy).toHaveBeenCalledWith('user1', 'test-group');
    expect(querySpy).toHaveBeenCalledWith('user2', 'test-group');
    expect(querySpy).toHaveBeenCalledWith('user3', 'test-group');
  });
});

describe('removeOneGroupMember', () => {
  const repo = new MiamiDamRepository(fakeConf);
  it('should call the correct endpoint with group name and memberId', async () => {
    const querySpy = jest.spyOn(repo.api, 'getQueryResults').mockResolvedValue({
      data: { success: true },
    });
    const res = await repo.removeOneGroupMember('fakeuser', 'test-group');
    expect(querySpy).toHaveBeenCalledWith({
      method: 'delete',
      url: 'https://fake.org/api/members/test-group/fakeuser',
    });
  });
});

describe('removeGroupMembers', () => {
  const repo = new MiamiDamRepository(fakeConf);
  const fakeUserList = ['user1', 'user2', 'user3'];
  it('should call removeOneGroupMember three times', async () => {
    const querySpy = jest
      .spyOn(repo, 'removeOneGroupMember')
      .mockImplementation(() => Promise.resolve());
    const res = await repo.removeGroupMembers(fakeUserList, 'test-group');
    expect(querySpy).toHaveBeenCalledTimes(3);
    expect(querySpy).toHaveBeenCalledWith('user1', 'test-group');
    expect(querySpy).toHaveBeenCalledWith('user2', 'test-group');
    expect(querySpy).toHaveBeenCalledWith('user3', 'test-group');
  });
});

describe('getEmailsFromGroupMembers', () => {
  const repo = new MiamiDamRepository(fakeConf);
  const groupMembers = require('./sample-data/miamiGroupResponse');
  const emails = repo.getEmailsFromGroupMembers(groupMembers);
  expect(emails).toEqual(['irwinkr@fake.org', 'bomholmm@fake.org']);
});

describe('getUniqueIdsFromEmails', () => {
  const repo = new MiamiDamRepository(fakeConf);
  const emails = ['irwinkr@fake.org', 'bomholmm@fake.org'];
  const memberIds = repo.getUniqueIdsFromEmails(emails);
  expect(memberIds).toEqual(['irwinkr', 'bomholmm']);
});
