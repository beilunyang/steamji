'use strict';
const { BOT_CONTENT_TYPE } = require("../../../constants/contentType");

/**
 * bot controller
 */

module.exports = {
  async createOrUpdateBot(ctx) {
    const uid = ctx.state.user.id;
    ctx.body = await strapi.service(BOT_CONTENT_TYPE).createOrUpdateBot(uid, ctx.request.body);
  },
  async findBot(ctx) {
    const uid = ctx.state.user.id;
    ctx.body = await strapi.service(BOT_CONTENT_TYPE).findBot(uid);
  },
  async stopBot(ctx) {
    const uid = ctx.state.user.id;
    ctx.body = await strapi.service(BOT_CONTENT_TYPE).stopBot(uid);
  },
  async startBot(ctx) {
    const uid = ctx.state.user.id;
    ctx.body = await strapi.service(BOT_CONTENT_TYPE).startBot(uid);
  },
  async pauseBot(ctx) {
    const uid = ctx.state.user.id;
    ctx.body = await strapi.service(BOT_CONTENT_TYPE).pauseBot(uid);
  },
  async resumeBot(ctx) {
    const uid = ctx.state.user.id;
    ctx.body = await strapi.service(BOT_CONTENT_TYPE).resumeBot(uid);
  },
  async inputBot(ctx) {
    const uid = ctx.state.user.id;
    ctx.body = await strapi.service(BOT_CONTENT_TYPE).inputBot(uid, ctx.request.body);
  },
};
