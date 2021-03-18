module.exports = {
  emailDomain: '', // include @, e.g. '@wherever.edu'
  queryConf: {
    convert: {
      options: {
        hostname: '', // e.g. api.campus.wherever.edu
        port: 443,
        pathStem: '', // path/to/userid/api?q=
        // path: configure at query time
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    },
  },
};
