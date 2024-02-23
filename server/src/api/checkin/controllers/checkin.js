'use strict';
const { createCoreController } = require("@strapi/strapi").factories;
const { CHECKIN_CONTENT_TYPE } = require("../../../constants/contentType");
const { CHECKIN_COIN } = require("../../../constants/taskCoin");

module.exports = {
  async findOne(ctx) {
    const { name } = ctx.params;
    const uid = ctx.state.user.id;
    ctx.body = await strapi.service(CHECKIN_CONTENT_TYPE).findOne(uid, name);
  },
  async checkin(ctx) {
    const uid = ctx.state.user.id;
    ctx.body = await strapi.service(CHECKIN_CONTENT_TYPE).checkin(uid, CHECKIN_COIN);
  },
};
