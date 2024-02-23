'use strict';

const { TASK_CONTENT_TYPE } = require("../../../constants/contentType");
const { SHARE_APP_COIN } = require("../../../constants/taskCoin");

module.exports = {
  async finishShareTask(ctx) {
    const uid = ctx.state.user.id;
    ctx.body = await strapi.service(TASK_CONTENT_TYPE).finishTask(uid, SHARE_APP_COIN, 'share');
  },
};
