"use strict";
const { ASF_BOT } = require("../../../constants/endpoint");
const {
  SERVER_CONTENT_TYPE,
  BOT_CONTENT_TYPE,
  TASK_CONTENT_TYPE,
  LOG_CONTENT_TYPE,
} = require("../../../constants/contentType");
const { BIND_STEAM_COIN } = require("../../../constants/taskCoin");
const { sanitizeSteam, aesEncrypt, aesDecrypt, asfClient } = require("../../../utils");

/**
 * bot service
 */

const delay = async (ms) => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms)
  });
};

const getAbsoluteUrl = (baseUrl, endpoint) => {
  return baseUrl + endpoint;
};

const getBotName = (uid) => {
  return uid;
};

const getBotAddress = async (uid) => {
  const bot = await strapi.db.query(BOT_CONTENT_TYPE).findOne({
    where: {
      users_permissions_user: uid,
    },
    populate: {
      server: true,
    },
  });
  if (!bot) {
    return {
      code: 20002,
      message: "bot不存在",
    };
  }
  return bot.server.address;
};

const createASFBotConfig = (config) => {
  const { name, password, pin, sign, online_status } = config;
  const transOnlineStatus = (status) => {
    if (status === "online") {
      return 1;
    }
    return 0;
  };
  let SteamParentalCode;
  if (pin?.trim?.()?.length >= 4) {
    SteamParentalCode = pin;
  }
  let SteamPassword;
  if (password) {
    SteamPassword = aesDecrypt(password);
  }
  return {
    SteamLogin: name,
    SteamPassword,
    SteamParentalCode,
    CustomGamePlayedWhileFarming: sign,
    OnlineStatus: transOnlineStatus(online_status),
    Enabled: false,
  };
};

const formatBotStatus = (info) => {
  if (!info) {
    return {};
  }
  const data = {
    running: info.KeepRunning, // Bot正在运行
    isConnected: info.IsConnectedAndLoggedOn, // Bot已登录连接
    isPaused: info.CardsFarmer.Paused, // Bot挂卡暂停
    gamesToFarm: info.CardsFarmer.GamesToFarm, // 剩余可挂卡游戏
    timeRemaining: info.CardsFarmer.TimeRemaining, // Bot剩余时间
    currentGamesFarming: info.CardsFarmer.CurrentGamesFarming, // Bot正在挂卡的游戏
    requiredInput: info.RequiredInput,
  };
  let status = "farming";
  let statusText = "正在挂卡";
  if (!data.running) {
    status = "stopped";
    statusText = "已停止";
  } else if (!data.isConnected) {
    status = "offline";
    statusText = "已离线";
  } else if (data.isPaused) {
    status = "paused";
    statusText = "已暂停";
  } else if (data.timeRemaining === "00:00:00") {
    status = "online";
    statusText = "在线中";
  } else if (!data.currentGamesFarming.length) {
    status = "online";
    statusText = "在线中";
  }
  return {
    status,
    statusText,
    ...data,
  };
};

const findBot = async (uid, address) => {
  let addressOrError = address;
  if (!addressOrError) {
    addressOrError = await getBotAddress(uid);
    if (typeof addressOrError !== "string") {
      return addressOrError;
    }
  }
  try {
    const res = await asfClient.get(
      getAbsoluteUrl(addressOrError, `${ASF_BOT}/${getBotName(uid)}`)
    );
    if (res.data.Success) {
      const result = res.data.Result;
      return {
        code: 10000,
        data: formatBotStatus(result?.[uid]),
      };
    }
    console.error("[ASF RES ERROR]: ", res.data);
  } catch (err) {
    console.error("[ASF ERROR]: ", err.message);
  }
  return {
    code: 20001,
    message: "应用服务发生错误",
  };
};

const createOrUpdateBot = async (uid, steam) => {
  const server = await strapi.db.query(SERVER_CONTENT_TYPE).findOne({
    select: ["address", "id"],
    where: { is_valid: true },
    orderBy: {
      online_user: "asc",
    },
  });
  let bot = await strapi.db.query(BOT_CONTENT_TYPE).findOne({
    where: {
      users_permissions_user: uid,
    },
  });
  const botData = {
    server: server.id,
    name: steam.name,
    pin: steam.pin,
    sign: steam.sign,
    online_status: steam.online_status,
    users_permissions_user: uid,
  };
  if (steam.password) {
    botData.password = aesEncrypt(steam.password);
  }
  if (bot) {
    bot = await strapi.entityService.update(BOT_CONTENT_TYPE, bot.id, {
      data: botData,
    });
  } else {
    bot = await strapi.entityService.create(BOT_CONTENT_TYPE, {
      data: botData,
    });
    console.log('[New BOT Create]:', bot.name);
    // strapi.service(LOG_CONTENT_TYPE).sendMsgToWechatWork(`一个新的ASF bot正在创建: [bot ID]: ${bot.id} [steam账号]: ${bot.name}`);
  }
  if (bot) {
    const botConfig = createASFBotConfig(bot);
    const res = await asfClient.post(
      getAbsoluteUrl(server.address, `${ASF_BOT}/${getBotName(uid)}`),
      {
        BotConfig: botConfig,
      }
    );
    if (res?.data?.Success) {
      const walletRes = await strapi
        .service(TASK_CONTENT_TYPE)
        .finishTask(uid, BIND_STEAM_COIN, "bind_steam", true);
      if (walletRes) {
        return {
          code: 10000,
          data: {
            wallet: walletRes.data,
            steam: sanitizeSteam(bot),
          },
        };
      }
    }
  }
  return {
    code: 20001,
    message: "应用服务发生错误",
  };
};

const commandBot = async (uid, command, params, time=1000) => {
  console.log(`[uid_${uid}]: ${command} bot`)
  const addressOrError = await getBotAddress(uid);
  if (typeof addressOrError !== "string") {
    return addressOrError;
  }
  try {
    const res = await asfClient.post(
      getAbsoluteUrl(
        addressOrError,
        `${ASF_BOT}/${getBotName(uid)}/${command}`
      ),
      params,
    );
    if (res.data.Success) {
      if (time > 0) {
        // await delay(time);
      }
      return await findBot(uid, addressOrError);
    }
    console.error(`[ASF ${command} RES ERROR]:`, res.data);
  } catch (err) {
    console.error(`[ASF ${command} ERROR]:`, err.message);
  }
  return {
    code: 20001,
    message: "应用服务发生错误",
  };
};

const stopBot = (uid) => {
  return commandBot(uid, "Stop");
};

const startBot = async (uid) => {
  return commandBot(uid, "Start");
};

const pauseBot = (uid) => {
  return commandBot(uid, "Pause", {
    Permanent: true,
    ResumeInSeconds: 0,
  });
};

const resumeBot = (uid) => {
  return commandBot(uid, "Resume");
};

const inputBot = (uid, params) => {
  return commandBot(uid, "Input", {
    Type: params.type,
    Value: params.value,
  }, 0);
};

module.exports = {
  getBotName,
  findBot,
  stopBot,
  startBot,
  pauseBot,
  resumeBot,
  createOrUpdateBot,
  inputBot,
};
