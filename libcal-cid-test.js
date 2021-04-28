const conf = require('./config/libCal');
const LibCalApi = require('./models/LibCalApi');
const api = new LibCalApi(conf);

(async () => {
  let res = await api.getSoftwareCategories();
  console.log(JSON.stringify(res));
})();
