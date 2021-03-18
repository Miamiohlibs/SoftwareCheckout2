const LibCalApi = require('../classes/LibCalApi');
const conf = require('../config/libCal');
const sampleBookings = require('./sample-data/libCalBookingsSample');
const appConf = require('../config/appConf')
const dynamicDatesBookings = require('./sample-data/libCalBookingsSampleDynamic');
const bookingObject = require('./sample-data/bookingObject');

describe('LibCalApi initialization', () => {
  it('should have some basic variables set on initialization', () => {
    const myApi = new LibCalApi(conf);
    expect(myApi).toHaveProperty('conf');
  });
});

describe('LibCalApi gets token', () => {
  it('should get an access token', async () => {
    const myApi = new LibCalApi(conf);
    token = await myApi.getToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);
  });
});

describe('LibCalApi can get a lists of categories', () => {
  it('should find at least one category', async () => {
    const myApi = new LibCalApi(conf);
    var token = await myApi.getToken();
    var categories = await myApi.getOneLibCalList('categories');
    expect(categories.length).toBeGreaterThan(0);
    var obj = JSON.parse(categories);
    expect(obj[0]).toHaveProperty('lid')
  });
});

describe('LibCalApi can get the booking lists', () => {

  beforeEach(() => {
    myApi = new LibCalApi(conf);
  });

  it('should bring back an array of software and bookings info on getLibCalLists()', async () => {
    await myApi.getToken();
    let bookings = await myApi.getLibCalLists();
    expect(bookings).toBeInstanceOf(Array);
    expect(bookings[0]).toHaveProperty('cid');
    expect(bookings[0]).toHaveProperty('name');
    expect(bookings[0]).toHaveProperty('bookings');
  });

  it('should add a campusCode to each LibCal category', () => {
    let softwareWithCodes = myApi.mapLibCal2ShortName(sampleBookings, appConf.software);
    expect(softwareWithCodes[0]).toHaveProperty('shortName');
    expect(softwareWithCodes[0].shortName).toBe('photoshop');
  });

  it('should correctly filter a bookings array for current, confirmed requests', () => {
    let currentConfirmed = myApi.getCurrentLibCalBookings(dynamicDatesBookings);
    expect(currentConfirmed.length).toBe(1);
    expect(currentConfirmed[0].bookId).toBe('csLVDpYHB');
  });

  it('should be return just email addresses from a booking array', () => {
    let result = myApi.getEmailsFromBookings(bookingObject);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(3);
    expect(result[0]).toBe('jerry.yarnetsky@miamioh.edu')
  });
});

