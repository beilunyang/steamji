'use strict';
const { LOG_CONTENT_TYPE } = require('../../../constants/contentType');

/**
 * log controller
 */

module.exports = {
  async find(ctx) {
    const uid = ctx.state.user.id;
    ctx.query = {
      ...ctx.query,
      filters: {
        users_permissions_user: uid,
      },
      fields: ['id', 'type', 'created_time', 'content'],
    };
    ctx.body = await strapi.service(LOG_CONTENT_TYPE).find(ctx.query);
  },
  async wechat(ctx) {
    const body = ctx.request.body
    if (body) {
      const {
        event,
        createdAt,
        model,
        entry,
      } = body
      if (['User', 'checkin', 'bot'].indexOf(model) === -1) {
        ctx.body = null
        return
      }

      let msg = `[${createdAt}]`
      const user = entry.users_permissions_user
      if (user) {
        let userType = '未知'
        if (user.wx_openid) {
          userType = '微信'
        }
        if (user.qq_openid) {
          userType = 'QQ'
        }
        msg += `[${userType}用户:${user.username}]`
      }

      switch (event) {
        case 'entry.create':
          msg += `创建了一个新的${model}, Name: ${entry?.username || entry?.name}`
          break
        case 'entry.update':
          msg += `更新了${model}, ID: ${entry.id}`
          break
      }
      ctx.body = await strapi.service(LOG_CONTENT_TYPE).sendMsgToWechatWork(msg);
      return
    }
    ctx.body = null
  },
};
