const CryptoJS = require('crypto-js');
const dayjs = require('dayjs');
const axios = require('axios');
const asfConfig = require('../asf/ASF.json');

const asfClient = axios.create({
  headers: {
    Authentication: asfConfig.IPCPassword,
  },
});

const safeJSONParse = (str) => {
  let obj = {};
  try {
    obj = JSON.parse(str);
  } catch (err) {
  }
  return obj;
}

const isTimeExpire = (dateTime) => {
  if (!dateTime) {
    return true;
  }
  return dayjs(dateTime).isBefore(dayjs());
};

const sanitizeSteam = (steam) => {
  if (steam) {
    return {
      id: steam.id,
      sign: steam.sign,
      pin: steam.pin,
      run_mode: steam.run_mode,
      online_status: steam.online_status,
      name: steam.name,
    };
  }
  return null;
};

const aesEncrypt = (str) => {
  return CryptoJS.AES.encrypt(str, process.env.AES_KEY).toString();
};

const aesDecrypt = (str) => {
  return CryptoJS.AES.decrypt(str, process.env.AES_KEY).toString(CryptoJS.enc.Utf8);
};

module.exports = {
  isTimeExpire,
  safeJSONParse,
  sanitizeSteam,
  aesEncrypt,
  aesDecrypt,
  asfClient,
};
