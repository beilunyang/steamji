const {
  USER_CONTENT_TYPE,
  BOT_CONTENT_TYPE,
} = require("../src/constants/contentType");
const { isTimeExpire } = require("../src/utils");

module.exports = {
  // 每1小时执行一次
  // 强制终止VIP已过期用户的挂卡bot
  "00 */1 * * *": async ({ strapi }) => {
    console.log("[CRON TASK]: start");
    const count = await strapi.db.query(USER_CONTENT_TYPE).count();
    let start = 0;
    let limit = 20;
    while (start <= count) {
      const users = await strapi.entityService.findMany(USER_CONTENT_TYPE, {
        start,
        limit,
        populate: ['bot', 'wallet'],
      });
      for (const user of users) {
        const isExpire = isTimeExpire(user?.wallet?.vip_expiration);
        if (isExpire && user?.bot?.id) {
          strapi
            .service(BOT_CONTENT_TYPE)
            .stopBot(user.id)
            .catch(err => console.error("[STOP ASF TASK ERROR]:", err.message));
        }
      }
      start += limit;
    }
    console.log("[CRON TASK]: end");
  },
};
