module.exports = {
  softwareLocation: 1234, // REPLACE WITH the LibCal Location ID where your library has its software to be checked out
  credentials: {
    client: {
      id: '123', // REPLACE WITH your LibCal Api "Client ID"
      secret: 'b566c23f------------------394b0ffb02', // REPLACE WITH your LibCal Api "Client Secret"
      secretParamName: 'client_secret',
      idParamName: 'client_id'
    },
    auth: {
      tokenHost: 'https://yourlib.libcal.com', // REPLACE WITH your libcal server (with https://)
      tokenPath: '/1.1/oauth/token',
      revokePath: '/1.1/oauth/revoke',
      authorizeHost: 'https://yourlib.libcal.com', // REPLACE WITH your libcal server (with https://)
      authorizePath: '/1.1/oauth/token'
    },
    http: {
      json: 'force',
      headers: {
        grant_type: 'client_credentials',
      }
    },
    options: {
      bodyFormat: 'form'
    }
  },
  queryConfig: {
    options: {
      hostname: 'yourlib.libcal.com', //your libcal server (without https://)
      port: 443, 
      path: '', //set at query time, LEAVE BLANK
      method: 'GET',
      headers: {
        // set at query time, LEAVE BLANK
      }
    },
  }
}