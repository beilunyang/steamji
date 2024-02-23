module.exports = ({ strapi }) => ({
  async login(ctx) {
    ctx.body = await strapi
      .plugin('strapi-auth')
      .service('qqService')
      .login(ctx);
  },
});
