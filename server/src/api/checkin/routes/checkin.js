'use strict';

module.exports = {
  prefix: '/checkins',
  routes: [
    {
      method: 'GET',
      path: '/:name',
      handler: 'checkin.findOne',
    },
    {
      method: 'POST',
      path: '/',
      handler: 'checkin.checkin',
    },
  ],
};
