const WebSocket = require('ws');
const EventEmitter = require('events');
const { Writable, pipeline } = require('stream');
const { createCoreService } = require('@strapi/strapi').factories;
const { safeJSONParse } = require('../../../utils');
const { ASF_LOG } = require('../../../constants/endpoint');
const { LOG_CONTENT_TYPE, SERVER_CONTENT_TYPE } = require('../../../constants/contentType');
const asfConfig = require('../../../../asf/ASF.json');
const axios = require('axios');

class DBStream extends Writable {
  constructor(clearConnectTime) {
    super();
    this.clearConnectTime = clearConnectTime;
  }

  async _write(chunk, _, callback) {
    this.clearConnectTime();
    const str = chunk.toString();
    const { Result } = safeJSONParse(str);
    if (Result) {
      const resArr = Result.split('|');
      const uid = Number(resArr[3]);
      if (typeof uid === 'number' && !isNaN(uid)) {
        try {
          const logs = await strapi.entityService.findMany(LOG_CONTENT_TYPE, {
            filters: {
              users_permissions_user: uid,
            },
            sort: {
              id: 'asc',
            },
          });
          if (logs.length >= 20) {
            const dirtyLogs = logs.slice(0, logs.length - 20);
            await strapi.db.query(LOG_CONTENT_TYPE).deleteMany({
              where: {
                id: {
                  $in: dirtyLogs.map(log => log.id)
                },
              },
            });
          }
        } catch (err) {
          console.log('[ASF LOG DELETE DIRTY LOGS ERROR]:', err.message);
        }
        try {
          await strapi.entityService.create(LOG_CONTENT_TYPE, {
            data: {
              users_permissions_user: uid,
              content: resArr[4],
              created_time: resArr[0],
              type: resArr[2],
              raw: Result,
            },
          });
        } catch (err) {
          console.log('[ASF LOG WRITE DB ERROR]:', err.message);
        }
      }
    }
    callback();
  }
}

let connectTime = 0;
let timer = null;

const createWSClient = async (emitter) => {
  const connect = (address) => {
    if (connectTime > 19) {
      console.log('[ASF WS CONNECT]:', `超出最大重连次数，终止重连`);
      strapi.service(LOG_CONTENT_TYPE).sendMsgToWechatWork(`ASF WS 服务超过最大重连次数: ${address}`);
      return;
    }
    connectTime++;
    console.log('[ASF WS CONNECT]:', `第${connectTime}次连接`);
    const ws = new WebSocket(`${address}${ASF_LOG}?password=${asfConfig.IPCPassword}`);
    ws.on("close", () => {
      console.log('[ASF WS CLOSED]: ', address);
      if (timer) {
        return;
      }
      timer = setTimeout(() => {
        timer = null;
        connect(address);
      }, 1000 * connectTime);
    });
    ws.on("error", (err) => {
      console.error('[ASF WS ERROR]:', err.message);
    });
    const stream = WebSocket.createWebSocketStream(ws);
    emitter.emit('data', {
      address,
      stream,
    });
  };
  const servers = await strapi.entityService.findMany(SERVER_CONTENT_TYPE, {
    fields: ['address'],
    filters: {
      is_valid: true,
    },
  });
  servers.forEach(server => {
    const address = server.address.replace(/^https?/, 'ws');
    connect(address);
  });
};

const logIntoDBRealTime = async () => {
  const emitter = new EventEmitter();
  emitter.on('data', (client) => {
    pipeline(client.stream, new DBStream(() => connectTime = 0), (err) => {
      err && console.error('[ASF LOG FORWARD ERROR]:', err.message);
    });
  });
  createWSClient(emitter);
};

let wechatWorkAccessToken;

const getWechatWorkAccessToken = async (needRefresh) => {
  if (!wechatWorkAccessToken || needRefresh) {
    const res = await axios.get('https://qyapi.weixin.qq.com/cgi-bin/gettoken', {
      params: {
        corpid: process.env.CORPID,
        corpsecret: process.env.CORPSECRET,
      },
    });
    if (res.status >= 200 && res.status < 400) {
      const data = res.data;
      if (data && data.errcode === 0) {
        wechatWorkAccessToken = data.access_token;
      }
    }
  }
};

const sendMsgToWechatWork = async (msg, retry = true) => {
  try {
    await getWechatWorkAccessToken();
    const res = await axios.post('https://qyapi.weixin.qq.com/cgi-bin/message/send', {
      touser: process.env.TOUSER,
      msgtype: 'text',
      agentid: process.env.AGENTID,
      text: {
        content: msg,
      },
    }, {
      params: {
        access_token: wechatWorkAccessToken,
      },
    });
    if (res.status >= 200 && res.status < 400) {
      const data = res.data;
      if (data && data.errcode !== 0) {
        console.error('[SEND MSG TO WECHAT WORK ERRCODE FAILURE]:', data);

        if (data.errcode === 40014 || data.errcode === 41001 || data.errcode === 42001) {
          await getWechatWorkAccessToken(true);
          if (retry) {
            sendMsgToWechatWork(msg, false);
          }
        }
        return;
      }
      console.log('[SEND MSG TO WECHAT WORK SUCCESS]:', msg);
      return;
    }
    console.error('[SEND MSG TO WECHAT WORK FAILURE]:', res);
  } catch (err) {
    console.error('[SEND MSG TO WECHAT WORK ERROR]:', err);
  }
};

module.exports = createCoreService('api::log.log', {
  logIntoDBRealTime,
  sendMsgToWechatWork,
});
