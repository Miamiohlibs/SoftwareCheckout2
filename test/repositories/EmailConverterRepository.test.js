const { JsonWebTokenError } = require('jsonwebtoken');
const EmailConverterRepository = require('../../repositories/EmailConverterRepository');
const realAppConf = require('../../config/appConf');

const repo = new EmailConverterRepository(realAppConf);
const testEmails = [
  'dr.seuss@fake.org',
  'chiconel@fake.org',
  'alex.the.great@fake.org',
];

describe('EmailConverterRepository initializations', () => {
  it('should initialize an EmailConverterRepo', () => {
    expect(repo instanceof EmailConverterRepository).toBe(true);
  });
});

describe('EmailConverterRepository: getAuthoritativeEmailsBatch', () => {
  getAuthSpy = jest
    .spyOn(repo.api, 'getAuthoritativeEmail')
    .mockImplementation(() => Promise.resolve());
  it('should call getAuthoritativeEmail 3 times for 3 queries', async () => {
    let res = await repo.getAuthoritativeEmailsBatch(testEmails);
    expect(getAuthSpy).toHaveBeenCalledTimes(3);
  });
});
