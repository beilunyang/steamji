module.exports = {
  'content-api': {
    routes: [
      {
        method: 'POST',
        path: '/wxlogin',
        handler: 'wechatController.login',
        config: {
          prefix: '',
          description: '微信小程序登录',
          policies: [],
          auth: false,
          tag: {
            plugin: 'strapi-auth',
            name: 'Auth',
          },
        },
      },
      {
        method: 'POST',
        path: '/qqlogin',
        handler: 'qqController.login',
        config: {
          prefix: '',
          description: 'QQ小程序登录',
          policies: [],
          auth: false,
          tag: {
            plugin: 'strapi-auth',
            name: 'Auth',
          },
        },
      },
    ],
    type: 'content-api',
  }
};
