const { WALLET_CONTENT_TYPE, BOT_CONTENT_TYPE } = require("../../../constants/contentType");
const { isTimeExpire } = require("../../../utils");

module.exports = () => {
  return async (ctx, next) => {
    console.log("[CHECK VIP]: start");
    const uid = ctx.state.user.id;
    const wallet = await strapi.db.query(WALLET_CONTENT_TYPE).findOne({
      where: {
        users_permissions_user: uid,
      },
    });

    const isExpire = isTimeExpire(wallet.vip_expiration);
    if (isExpire) {
      console.log("[CHECK VIP]: no pass");
      const url = ctx.request.url;
      if (url.indexOf('pause') > - 1 || url.indexOf('resume') > -1 || url.indexOf('stop') > -1) {
        await strapi.service(BOT_CONTENT_TYPE).stopBot(uid);
      }
      ctx.body = {
        code: 60001,
        message: 'VIP已过期, 请兑换VIP后再重新操作',
      };
      return;
    }
    console.log("[CHECK VIP]: pass");
    await next();
  };
};
