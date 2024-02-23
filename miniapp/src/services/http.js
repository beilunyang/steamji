import Taro from '@tarojs/taro';
import { BASE_URL } from '../constants/endpoints';

const init = async () => {};

const getAbsoluteUrl = (url) => {
  if (url.indexOf('http') > -1) {
    return url;
  }
  return BASE_URL + url;
};

const request = async (options) => {
  try {
    const url = getAbsoluteUrl(options.url);
    const jwt = window?.jwt;
    console.log('url:', url, '||jwt:', jwt);
    const header = jwt ? {
      Authorization: `Bearer ${jwt}`,
    } : {};
    const response = await Taro.request({
      ...options,
      url,
      header,
    });
    if (response.statusCode >= 400) {
      return;
    }
    if (response.data) {
      return response.data;
    }
  } catch (err) {
    console.error(err.message);
  }
};

const get = (options) => {
  const opt = {
    ...options,
    method: 'GET',
  };
  return request(opt);
};

const post = (options) => {
  const opt = {
    ...options,
    method: 'POST',
  };
  return request(opt);
};

export default {
  get,
  post,
  init,
};
