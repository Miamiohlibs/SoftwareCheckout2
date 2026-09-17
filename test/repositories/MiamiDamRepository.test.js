const { beforeEach } = require('node:test');
const MiamiDamRepository = require('../../repositories/MiamiDamRepository');
const fakeConf = require('../sample-data/miamiDamConf');

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
