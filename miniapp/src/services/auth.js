import Taro from "@tarojs/taro";
import { LOGIN } from "../constants/endpoints";
import http from "./http";

let isLogining = false;

const login = async (userInfo) => {
  const data = await Taro.login()
  if (data?.code) {
    if (isLogining) {
      return;
    }
    isLogining = true;
    const res = await http.post({
      url: LOGIN,
      data: {
        jsCode: data.code,
        userInfo,
      },
    });
    isLogining = false;
    return res;
  }
};

export default {
  login,
};
