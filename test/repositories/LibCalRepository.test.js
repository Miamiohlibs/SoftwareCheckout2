const LibCalRepo = require('../../repositories/LibCalRepository');
const fakeConf = require('../models/sample-data/libCalFakeConf');
const realConf = require('../../config/libCal');
const repo = new LibCalRepo(fakeConf);
// const repo = new LibCalRepo(realConf);
const bookingsResponse = require('./sample-data/libCalBookingsResponse');

describe('initialization', () => {
  it('should get a new LibCalApi instance on initialization', () => {
    let tempRepo = new LibCalRepo(fakeConf);
    expect(tempRepo).toHaveProperty('api');
  });
});

describe('LibCalRepo: filterToCurrentBookings', () => {
  it('should get three current bookings from the test data', () => {
    res = repo.filterToCurrentBookings(bookingsResponse);
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(3);
    expect(res[0]).toHaveProperty('eid');
    expect(res[0].eid).toBe(61240);
    expect(res[1]).toHaveProperty('eid');
    expect(res[1].eid).toBe(71240);
    expect(res[2]).toHaveProperty('eid');
    expect(res[2].eid).toBe(75562);
  });
});

describe('LibCalRepo: filterToValidBookings', () => {
  it('should get four current bookings from the test data', () => {
    res = repo.filterToValidBookings(bookingsResponse);
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(4);
    expect(res[0]).toHaveProperty('eid');
    expect(res[0].eid).toBe(61240);
    expect(res[1]).toHaveProperty('eid');
    expect(res[1].eid).toBe(75562);
    expect(res[2]).toHaveProperty('eid');
    expect(res[2].eid).toBe(75853);
    expect(res[3]).toHaveProperty('eid');
    expect(res[3].eid).toBe(75542);
  });
});

describe('LibCalRepo: getCurrentValidBookings', () => {
  beforeEach(() => {
    bookingSpy = jest
      .spyOn(repo.api, 'getBookings')
      .mockResolvedValue(bookingsResponse);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call getBookings with cid=12345', async () => {
    res = await repo.getCurrentValidBookings('12345');
    expect(bookingSpy).toHaveBeenCalledTimes(1);
    expect(bookingSpy).toHaveBeenCalledWith('12345');
  });
  it('should return two current, valid bookings', async () => {
    res = await repo.getCurrentValidBookings('12345');
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(2);
    expect(res[0]).toHaveProperty('eid');
    expect(res[0].eid).toBe(61240);
    expect(res[1]).toHaveProperty('eid');
    expect(res[1].eid).toBe(75562);
  });
});

describe('LibCalRepo: getUniqueEmailsFromBookings', () => {
  it('should find four unique users in the test data', () => {
    let res = repo.getUniqueEmailsFromBookings(bookingsResponse);
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(4);
    expect(res).toEqual([
      'jeruser@fake.org',
      'evanuser@fake.org',
      'domuser@fake.org',
      'sethuser@fake.org',
    ]);
  });
});
