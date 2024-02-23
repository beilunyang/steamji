'use strict';

/**
 * vip router
 */

module.exports = {
  prefix: '/vips',
  routes: [
    {
      method: 'GET',
      path: '/',
      handler: 'vip.find',
    },
    {
      method: 'POST',
      path: '/exchange',
      handler: 'vip.exchange',
    },
  ],
};
