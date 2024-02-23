'use strict';

const { WALLET_CONTENT_TYPE, TASK_CONTENT_TYPE } = require("../../../constants/contentType");
const dayjs = require('dayjs');

const addCoin = async (uid, coin) => {
  const wallet = await strapi.db.query(WALLET_CONTENT_TYPE).findOne({
    where: {
      users_permissions_user: uid,
    },
  });
  const updatedCoin = Number(wallet.coin) + Number(coin);
  return await strapi.db.query(WALLET_CONTENT_TYPE).update({
    where: {
      users_permissions_user: uid,
    },
    select: ['coin', 'vip_expiration'],
    data: {
      coin: updatedCoin,
    },
  });
};

const finishTask = async (uid, coin, label, once) => {
  const field = `${label}_finished_date`;
  let task = await strapi.db.query(TASK_CONTENT_TYPE).findOne({
    where: {
      users_permissions_user: uid,
    },
  });
  if (!task) {
    task = await strapi.entityService.create(TASK_CONTENT_TYPE, {
      data: {
        users_permissions_user: uid,
      },
    })
  }
  if (once && task[field]) {
    return {
      code: 30002,
      message: '新手任务已完成',
    };
  }
  const isFinished = dayjs().isSame(task[field], 'day');
  if (isFinished) {
    return {
      code: 30001,
      message: '今日任务已完成',
    };
  }
  const newWallet = await addCoin(uid, coin);
  const newTask = await strapi.db.query(TASK_CONTENT_TYPE).update({
    where: {
      id: task.id,
    },
    select: ['bind_steam_finished_date', 'share_finished_date'],
    data: {
      [field]: dayjs().format('YYYY-MM-DD'),
    },
  })
  if (newWallet && newTask) {
    return {
      code: 10000,
      data: {
        ...newWallet,
        share_task_finished: true,
      },
    };
  }
  return {
    code: 30001,
    message: '任务失败',
  };
};

module.exports = {
  finishTask,
  addCoin,
};
