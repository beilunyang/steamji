import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import qs from 'qs'
import {
  BOT,
  BOT_LOG,
  CHECK_IN,
  EXCHANGE_VIP_CARD,
  FINISH_SHARE_TASK,
  VIP_CARD,
} from '../constants/endpoints';
import http from './http';

dayjs.extend(utc);

const getRemoteConfig = async (key) => {
  return await http.get({
    url: '/configs?' + qs.stringify({
      filters: {
        key: {
          $eq: key,
        },
      },
      publicationState: 'live',
    }),
  });
}

const inputBot = async (type, value) => {
  return await http.post({
    url: BOT + '/input',
    data: {
      type,
      value,
    },
  });
};

const createOrUpdateBot = async (params = {}) => {
  return await http.post({
    url: BOT,
    data: params,
  });
};

const startBot = async (data) => {
  return await http.post({
    url: BOT + '/start',
    data,
  });
};

const stopBot = async () => {
  return await http.post({
    url: BOT + '/stop',
  });
};

const pauseBot = async () => {
  return await http.post({
    url: BOT + '/pause',
  });
};

const resumeBot = async () => {
  return await http.post({
    url: BOT + '/resume',
  });
};

const getBotInfo = async () => {
  return await http.get({
    url: BOT,
  });
};

const getBotLog = async (params = {}) => {
  return await http.get({
    url: BOT_LOG,
    data: {
      sort: 'id:desc',
      ...params,
    },
  });
};

const finishShareTask = async () => {
  return await http.post({
    url: FINISH_SHARE_TASK,
  });
};

const findCheckinInfo = async () => {
  return await http.get({
    url: `${CHECK_IN}/${dayjs().utc().format('YYYY-MM')}`,
  });
};

const checkin = async () => {
  return await http.post({
    url: CHECK_IN,
  });
};

const getVipCards = async () => {
  const { data } = await http.get({
    url: VIP_CARD,
  });
  return data;
};

const exchangeVip = async (id) => {
  return await http.post({
    url: EXCHANGE_VIP_CARD,
    data: {
      id,
    },
  });
};

export default {
  inputBot,
  createOrUpdateBot,
  startBot,
  stopBot,
  pauseBot,
  resumeBot,
  getBotInfo,
  getBotLog,
  finishShareTask,
  findCheckinInfo,
  checkin,
  getVipCards,
  exchangeVip,
  getRemoteConfig,
};
