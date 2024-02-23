import dayjs from 'dayjs';

const day = dayjs().get('date');

export const transformCheckinInfo = (calendar) => {
  const info = calendar.toString(2);
  return {
    calendar: info,
    isCheckin: info[day] === '1',
  };
};

export const getUserInputLabel = (id) => {
  // const types = {
  //   None: 0,
  //   Login: 1,
  //   Password: 2,
  //   SteamGuard: 3,
  //   SteamParentalCode: 4,
  //   TwoFactorAuthentication: 5,
  // };
  const types = {
    1: 'Steam账号名',
    2: 'Steam密码',
    3: 'Steam令牌',
    4: 'Steam家庭监护PIN码',
    5: 'Steam手机令牌',
  };
  return types[id];
}
