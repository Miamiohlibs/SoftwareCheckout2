const UniqEmailRepository = require('../../repositories/UniqEmailRepository');
const emailRepo = new UniqEmailRepository();
const testKnownHaystack = [
  {
    email: 'dr.seuss@fake.org',
    uniqEmail: 'geiselt@fake.org',
  },
  {
    email: 'madonna@fake.org',
    uniqEmail: 'chiconel@fake.org',
  },
  {
    email: 'chiconel@fake.org',
    uniqEmail: 'chiconel@fake.org',
  },
  {
    email: 'mr.t@fake.org',
    uniqEmail: 'tureaudl@fake.org',
  },
];
const testEmails = [
  'dr.seuss@fake.org',
  'chiconel@fake.org',
  'alex.the.great@fake.org',
];
const testObjects = [
  { user: 'Dr. Seuss', position: 'Professor', email: 'dr.seuss@fake.org' },
  { user: 'Madonna', position: 'CEO', email: 'chiconel@fake.org' },
  { user: 'Weird Al', position: 'Accordionist', email: 'weird.al@fake.org' },
];

describe('UniqEmailRepository: getUniqForEmail', () => {
  it('should find geiselt for dr.seuss', () => {
    let res = emailRepo.getUniqForEmail(testEmails[0], testKnownHaystack);
    expect(res).toEqual(['geiselt@fake.org']);
  });
  it('should find chiconel for chiconel', () => {
    let res = emailRepo.getUniqForEmail(testEmails[1], testKnownHaystack);
    expect(res).toEqual(['chiconel@fake.org']);
  });
  it('should find return an empty array for alex.the.great', () => {
    let res = emailRepo.getUniqForEmail(testEmails[2], testKnownHaystack);
    expect(res).toEqual([]);
  });
});

describe('UniqEmailRepository: getKnownAndUnknownEmails', () => {
  it('should find DrSeuss and Madonna, not find Alex the great', () => {
    let res = emailRepo.getKnownAndUnknownEmails(testEmails, testKnownHaystack);
    expect(res).toHaveProperty('found');
    expect(res.found).toEqual(['geiselt@fake.org', 'chiconel@fake.org']);
    expect(res).toHaveProperty('missing');
    expect(res.missing).toEqual(['alex.the.great@fake.org']);
  });
});

describe('UniqEmailRepository: buildEmailsQuery', () => {
  it('should build one JSON array with one email passed to it', () => {
    let res = emailRepo.buildEmailsQuery(['dr.seuss@fake.org']);
    expect(res).toEqual({ $or: [{ email: 'dr.seuss@fake.org' }] });
  });
  it('should build one JSON array with all emails passed to it', () => {
    let res = emailRepo.buildEmailsQuery(testEmails);
    expect(res).toEqual({
      $or: [
        { email: 'dr.seuss@fake.org' },
        { email: 'chiconel@fake.org' },
        { email: 'alex.the.great@fake.org' },
      ],
    });
  });
});

describe('UniqEmailRepository: updateObjectsWithKnownEmails', () => {
  it('should find Dr Seuss and Madonna, but not Weird Al, in known emails', async () => {
    let { found, missing } = await emailRepo.updateObjectsWithKnownEmails(
      testObjects,
      'email',
      testKnownHaystack
    );
    expect(found).toEqual([
      { user: 'Dr. Seuss', position: 'Professor', email: 'geiselt@fake.org' },
      { user: 'Madonna', position: 'CEO', email: 'chiconel@fake.org' },
    ]);
    expect(missing).toEqual([
      {
        user: 'Weird Al',
        position: 'Accordionist',
        email: 'weird.al@fake.org',
      },
    ]);
  });
});
