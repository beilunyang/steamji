'use strict';

module.exports = {
  prefix: '/logs',
  routes: [
    {
     method: 'GET',
     path: '/',
     handler: 'log.find',
    },
    {
      method: 'POST',
      path: '/wechat',
      handler: 'log.wechat',
    }
  ],
};
