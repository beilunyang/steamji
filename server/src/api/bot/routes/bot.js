'use strict';

/**
 * bot router
 */

module.exports = {
  prefix: '/bots',
  routes: [
    {
      method: 'GET',
      path: '/',
      handler: 'bot.findBot',
    },
    {
      method: 'POST',
      path: '/',
      handler: 'bot.createOrUpdateBot',
    },
    {
      method: 'POST',
      path: '/stop',
      handler: 'bot.stopBot',
    },
    {
      method: 'POST',
      path: '/start',
      handler: 'bot.startBot',
    },
    {
      method: 'POST',
      path: '/pause',
      handler: 'bot.pauseBot',
    },
    {
      method: 'POST',
      path: '/resume',
      handler: 'bot.resumeBot',
    },
    {
      method: 'POST',
      path: '/input',
      handler: 'bot.inputBot',
    },
  ].map((route) => {
    if (route.path !== '/') {
      route.config = {
        middlewares: [
          'api::bot.check-vip'
        ],
      }
    }
    return route;
  }),
};
