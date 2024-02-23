'use strict';

const dayjs = require('dayjs');
const { VIP_CONTENT_TYPE, WALLET_CONTENT_TYPE } = require('../../../constants/contentType');
const { isTimeExpire } = require('../../../utils');

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::vip.vip', {
  async exchange(uid, id) {
    const [vipCard, wallet] = await Promise.all([
      strapi.entityService.findOne(VIP_CONTENT_TYPE, id),
      strapi.db.query(WALLET_CONTENT_TYPE).findOne({
        where: {
          users_permissions_user: uid,
        },
      }),
    ]);
    const coin = wallet.coin - vipCard.coin;
    if (coin < 0) {
      return {
        code: 50001,
        message: '硬币数量不足',
      };
    }
    const isExpire = isTimeExpire(wallet.vip_expiration);
    let expireTime;
    if (isExpire) {
      expireTime = dayjs().add(vipCard.day, 'day');
    } else {
      expireTime = dayjs(wallet.vip_expiration).add(vipCard.day, 'day');
    }
    const newWallet = await strapi.entityService.update(WALLET_CONTENT_TYPE, wallet.id, {
      fields: ['coin', 'vip_expiration'],
      data: {
        vip_expiration: expireTime.toISOString(),
        coin,
      },
    });
    return {
      code: 10000,
      data: newWallet,
    };
  },
});
