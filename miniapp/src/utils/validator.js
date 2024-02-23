import dayjs from 'dayjs';

export const isValidEmail = (value) => {
  const regx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regx.test(value);
};

export const isValidUsername = (username) => {
  return username?.length > 2;
};

export const isTimeExpire = (dateTime) => {
  if (!dateTime) {
    return true;
  }
  return dayjs(dateTime).isBefore(dayjs());
};
