export const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://127.0.0.1/api' : 'https://exmaple.com/api';

export const LOGIN = process.env.TARO_ENV === 'qq' ? '/qqlogin' : '/wxlogin';

export const STEAM = '/steams/bind';

export const BOT = '/bots';

export const BOT_LOG = '/logs';

export const FINISH_SHARE_TASK = '/tasks/finish/share';

export const CHECK_IN = '/checkins';

export const VIP_CARD = '/vips';

export const EXCHANGE_VIP_CARD = '/vips/exchange';

