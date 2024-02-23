module.exports = ({ strapi }) => ({
  async login(ctx) {
    ctx.body = await strapi
      .plugin('strapi-auth')
      .service('wechatService')
      .login(ctx);
  },
});
