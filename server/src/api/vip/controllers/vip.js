'use strict';

const { VIP_CONTENT_TYPE } = require('../../../constants/contentType');

/**
 * vip controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::vip.vip', {
  async exchange(ctx) {
    const uid = ctx.state.user.id;
    const { id } = ctx.request.body;
    console.log('exchange id:', id);
    ctx.body = await strapi.service(VIP_CONTENT_TYPE).exchange(uid, id);
  },
});
