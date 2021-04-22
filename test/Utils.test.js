const Utils = require('../classes/Utils');
const u = new Utils();
testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

describe('Utils: chunkArray', () => {
  it('it should chunkArray return 2 arrays when max=5', () => {
    res = u.chunkArray(testArray, 5);
    expect(res.length).toBe(2);
    expect(res[0].length).toBe(5);
  });
  it('it should chunkArray return 3 arrays when max=4', () => {
    res = u.chunkArray(testArray, 4);
    expect(res.length).toBe(3);
    expect(res[0].length).toBe(4);
  });
});
