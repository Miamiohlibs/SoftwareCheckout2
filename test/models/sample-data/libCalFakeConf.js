module.exports = {
  softwareLocation: 1234, // REPLACE WITH the LibCal Location ID where your library has its software to be checked out
  credentials: {
    client: {
      id: '123', // REPLACE WITH your LibCal Api "Client ID"
      secret: 'a;sdlfajls;dfkjasd;lfkjads;lkajdf', // REPLACE WITH your LibCal Api "Client Secret"
      secretParamName: 'client_secret',
      idParamName: 'client_id',
    },
    auth: {
      tokenHost: 'https://mylib.libcal.com', // REPLACE WITH your libcal server
      tokenPath: '/1.1/oauth/token',
      revokePath: '/1.1/oauth/revoke',
      authorizeHost: 'https://mylib.libcal.com', // REPLACE WITH your libcal server
      authorizePath: '/1.1/oauth/token',
    },
  },
};
