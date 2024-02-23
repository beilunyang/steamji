'use strict';

const dayjs = require('dayjs');
const { CHECKIN_CONTENT_TYPE, TASK_CONTENT_TYPE } = require("../../../constants/contentType");

const checkin = async (uid, coin) => {
  const today = dayjs();
  const name = today.format('YYYY-MM');
  const day = today.get('date');
  const entity = await strapi.db.query(CHECKIN_CONTENT_TYPE).findOne({
    where: {
      users_permissions_user: uid,
      name,
    },
  });
  let res;
  if (!entity) {
    const calendar = new Array(32).fill(0);
    calendar[0] = 1;
    calendar[day] = 1;
    res = await strapi.entityService.create(CHECKIN_CONTENT_TYPE, {
      fields: ['name', 'calendar'],
      data: {
        name,
        calendar: parseInt(calendar.join(''), 2),
        users_permissions_user: uid,
      },
    });
  } else {
    // calendar是bigInt类型, strapi帮它作为string返回
    const calendar = Number(entity.calendar).toString(2).split('');
    const flag = calendar[day];
    if (flag === '1') {
      return {
        code: 40001,
        message: '今日已签到',
      };
    }
    calendar[day] = '1';
    res = await strapi.entityService.update(CHECKIN_CONTENT_TYPE, entity.id, {
      fields: ['name', 'calendar'],
      data: {
        calendar: parseInt(calendar.join(''), 2),
      },
    });
  }
  let wallet;
  if (res) {
    wallet = await strapi.service(TASK_CONTENT_TYPE).addCoin(uid, coin);
  }
  return {
    code: 10000,
    data: {
      checkin: res && {
        name: res.name,
        calendar: Number(res.calendar),
      },
      wallet,
    },
  };
};

const findOne = async (uid, name) => {
  const entity = await strapi.db.query(CHECKIN_CONTENT_TYPE).findOne({
    select: ['name', 'calendar'],
    where: {
      users_permissions_user: uid,
      name,
    }
  });
  return {
    code: 10000,
    data: entity && {
      name: entity.name,
      calendar: Number(entity.calendar),
    },
  };
};

module.exports = {
  findOne,
  checkin,
};

