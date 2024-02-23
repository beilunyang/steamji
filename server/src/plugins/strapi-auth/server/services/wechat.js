const crypto = require('crypto');
const axios = require('axios');
const _ = require('lodash');
const dayjs = require('dayjs');
const { getInviteCodeByUIDUnique } = require('../uitls');
const { WALLET_CONTENT_TYPE, USER_CONTENT_TYPE, TASK_CONTENT_TYPE } = require('../../../../constants/contentType');
const { INVITE_ONE_USER_COIN } = require('../../../../constants/taskCoin');


const sanitizeWallet = (wallet) => {
  return {
    coin: wallet.coin,
    vip_expiration: wallet.vip_expiration,
  };
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

const sanitizeTask = (task) => {
  return {
    share_task_finished: task && dayjs().isSame(task.share_finished_date, 'day'),
    bind_steam_task_finished: !!task?.bind_steam_finished_date,
  };
};

const sanitizeUser = (user) => {
  return {
    email: user.email,
    username: user.username,
    avatar: user.avatar,
    invite_code: user.invite_code,
    wallet: sanitizeWallet(user.wallet),
    steam: sanitizeSteam(user.bot),
    task: sanitizeTask(user.task),
  };
};

class Wechat {
	constructor() {
		this.appId = process.env.WX_APPID
		this.secret = process.env.WX_SECRET
	}

	decryptData(sessionKey, encryptedData, iv) {
		// base64 decode
		sessionKey = Buffer.from(sessionKey, 'base64')
		encryptedData = Buffer.from(encryptedData, 'base64')
		iv = Buffer.from(iv, 'base64')

		try {
			let decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv)
			decipher.setAutoPadding(true)
			let decoded = decipher.update(encryptedData, 'binary', 'utf8')
			decoded += decipher.final('utf8')

			decoded = JSON.parse(decoded)

		} catch (err) {
			throw new Error('Illegal Buffer')
		}

		if (decoded.watermark.appid !== this.appId) {
			throw new Error('Illegal Buffer')
		}

		return decoded
	}

	generateSignature(sessionKey, rawData) {
		const shasum = crypto.createHash('sha1')
		shasum.update(rawData + sessionKey)
		return shasum.digest('hex')
	}

	async getAccessToken() {
		const token_params = {
			appId: this.appId,
			secret: this.secret,
			grant_type: 'client_credential'
		}
		const url = 'https://api.weixin.qq.com/cgi-bin/token'
		const result = await axios.get(url, { params: token_params })
		return result.data
	}

	async login(jsCode) {
		const params = {
			appid: this.appId,
			secret: this.secret,
			js_code: jsCode,
			grant_type: 'authorization_code'
		}
		const url = 'https://api.weixin.qq.com/sns/jscode2session';
		const result = await axios.get(url, { params: params })
		return result.data
	}
}

const wx = new Wechat();

const getJWT = (user) => {
  const jwt = strapi.plugins['users-permissions'].services.jwt.issue(_.pick(user, ['id']));
  return jwt
}

const createUser = async (openid, userInfo = {}) => {
  const { email, username, avatar, invited_by } = userInfo;
  if (!email || !username) {
    return {
      code: 10001,
      message: '请提供必要的邮箱地址以及用户名',
    };
  }
  let newUser;
  const [u1, u2] = await Promise.all([
    strapi.db.query(USER_CONTENT_TYPE).findOne({
      where: {
        email,
        wx_openid: {
          $notNull: true,
        }
      }
    }),
    strapi.db.query(USER_CONTENT_TYPE).findOne({
      where: {
        username,
        wx_openid: {
          $notNull: true,
        }
      }
    }),
  ]);
  if (u1 && u2) {
    return {
      code: 10004,
      message: '邮箱地址以及用户名已被占用,请更改',
    };
  }
  if (u1) {
    return {
      code: 10002,
      message: '邮箱地址已被占用,请更改',
    };
  }
  if (u2) {
    return {
      code: 10003,
      message: '用户名已被占用,请更改',
    };
  }
  try {
    const wallet = await strapi.entityService.create(WALLET_CONTENT_TYPE, {
      data: {},
    });
    newUser = await strapi.entityService.create(USER_CONTENT_TYPE, {
      data: {
        wx_openid: openid,
        email,
        username,
        avatar,
        wallet: wallet.id,
        role: 1,
        invited_by,
      },
      populate: '*',
    })
    const invite_code = getInviteCodeByUIDUnique(newUser.id);
    newUser = await strapi.entityService.update(USER_CONTENT_TYPE, newUser.id, {
      data: {
        invite_code,
      },
      populate: '*',
    });
    if (newUser.invited_by) {
      const masterUser = await strapi.db.query(USER_CONTENT_TYPE).findOne({
        where: {
          invite_code: invited_by,
        },
      });
      if (masterUser) {
        strapi.service(TASK_CONTENT_TYPE).addCoin(masterUser.id, INVITE_ONE_USER_COIN);
      }
    }
  } catch (err) {
    console.error(err.message);
    return {
      code: 10001,
      message: '用户注册失败',
    };
  }
  console.log('[NEW USER LOGIN]:', newUser.username)
  const jwt = getJWT(newUser)
  strapi
  return {
    code: 10000,
    data: {
      jwt,
      user: sanitizeUser(newUser),
    },
  };
}

const returnUserWithJWT = async (user) => {
    const jwt = getJWT(user)
    return {
      code: 10000,
      data: {
        jwt,
        user: sanitizeUser(user),
      },
    };
}

const getUserById = async(id) => {
  const user = await strapi.entityService.findOne(USER_CONTENT_TYPE, id, {
    populate: '*',
  });
  const jwt = getJWT(user)
  return {
    code: 10000,
    data: {
      jwt: jwt,
      user: sanitizeUser(user),
    },
  };
}

const login = async (ctx) => {
  const { request } = ctx
  const { jsCode } = request.body
  const { id } = await strapi.plugins['users-permissions'].services.jwt.getToken(ctx) || {};
  if (id) {
    return getUserById(id);
  }

  const { openid } = await wx.login(jsCode)
  if (!openid) {
    return {
      code: 10005,
      message: '微信授权失败，请稍后重试',
    };
  }
  const user = await strapi.db.query(USER_CONTENT_TYPE).findOne({
    where: { wx_openid: openid },
    populate: true,
  });
  if (!user) {
    return createUser(openid, ctx.request.body.userInfo)
  } else {
    console.log('[OLD USER LOGIN]: ', user.username)
    return returnUserWithJWT(user)
  }
}

module.exports = ({ strapi }) => ({
  login,
});
