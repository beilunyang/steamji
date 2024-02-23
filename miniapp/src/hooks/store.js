import React, { useContext, useReducer } from 'react';
import Taro from '@tarojs/taro';
import _ from 'lodash-es';
import produce from 'immer';
import { transformCheckinInfo } from '../utils';

export const actionType = {
  SET_USER: Symbol(),
  SET_JWT: Symbol(),
  SET_SHOW_LOGIN_MODAL: Symbol(),
  SET_MINIAPP_PROFILE: Symbol(),
  SET_SERVER_LOGS: Symbol(),
  SET_BOT: Symbol(),
  SET_FINISH_TASK: Symbol(),
  SET_WALLET: Symbol(),
  SET_CHECK_IN: Symbol(),
};

export let StoreContext = React.createContext();

export const useStore = () => {
  const initState = {
    user: null,
    jwt: null,
    isShowLoginModal: false,
    miniappProfile: null,
    serverLogs: [],
    serverLogsPagination: {},
    bot: null,
    checkin: {},
  };
  const reducer = produce((draft, { type, payload }) => {
    switch (type) {
      case actionType.SET_USER:
        draft.user = !draft.user ? payload : _.merge(draft.user, payload);
        break;
      case actionType.SET_JWT:
        draft.jwt = payload;
        break;
      case actionType.SET_SHOW_LOGIN_MODAL:
        draft.isShowLoginModal = payload;
        break;
      case actionType.SET_MINIAPP_PROFILE:
        draft.miniappProfile = payload;
        break;
      case actionType.SET_SERVER_LOGS:
        if (payload.pagination.page === 1) {
          draft.serverLogs = payload.results;
        } else {
          draft.serverLogs = [...draft.serverLogs, payload.results];
        }
        draft.serverLogsPagination = payload.pagination;
        break;
      case actionType.SET_BOT:
        draft.bot = payload;
        break;
      case actionType.SET_FINISH_TASK:
        draft.user.task[`${payload.type}_task_finished`] = payload.finished;
        break;
      case actionType.SET_CHECK_IN:
        const info = transformCheckinInfo(payload.calendar);
        draft.checkin = info;
        break;
      case actionType.SET_WALLET:
        console.log('SET_WALLET payload:', payload);
        draft.user.wallet = _.merge(draft.user.wallet, payload);
        break;
      default:
        break;
    }
  });
  const [state, dispatch] = useReducer(reducer, initState);
  return {
    state,
    dispatch,
  };
};

export const useStoreContext = () => {
  return useContext(StoreContext);
}

export const useStoreState = () => {
  const { state } = useStoreContext();
  return state;
};

export const useUserAction = () => {
  const { dispatch } = useStoreContext();
  return (user) => {
    dispatch({
      type: actionType.SET_USER,
      payload: user,
    });
  };
};

export const useJWTAction = () => {
  const { dispatch } =  useStoreContext();
  return (jwt) => {
    window.jwt = jwt;
    dispatch({
      type: actionType.SET_JWT,
      payload: jwt,
    });
  };
};

export const useShowLoginModalAction = () => {
  const { dispatch } = useStoreContext();
  return (isShow) => {
    dispatch({
      type: actionType.SET_SHOW_LOGIN_MODAL,
      payload: isShow,
    });
  };
};

export const useMiniappProfileAction = () => {
  const { dispatch } = useStoreContext();
  return async (userInfo) => {
    if (userInfo) {
      dispatch({
        type: actionType.SET_MINIAPP_PROFILE,
        payload: userInfo,
      });
      return;
    }
    const res = await Taro.getUserProfile({
      desc: '用于完善用户信息',
    });
    dispatch({
      type: actionType.SET_MINIAPP_PROFILE,
      payload: res.userInfo,
    });
  };
};

export const useServerLogsAction = () => {
  const { dispatch } = useStoreContext();
  return (data) => {
    dispatch({
      type: actionType.SET_SERVER_LOGS,
      payload: data,
    });
  };
};
export const useCheckinAction = () => {
  const { dispatch } = useStoreContext();
  return (checkin) => {
    if (!checkin.calendar) {
      return;
    }
    dispatch({
      type: actionType.SET_CHECK_IN,
      payload: checkin,
    });
  };
};
export const useBotAction = () => {
  const { dispatch } = useStoreContext();
  return (bot) => {
    dispatch({
      type: actionType.SET_BOT,
      payload: bot,
    });
  };
};

export const useTaskAction = () => {
  const { dispatch } = useStoreContext();
  return ({ type, finished }) => {
    dispatch({
      type: actionType.SET_FINISH_TASK,
      payload: {
        type,
        finished,
      },
    });
  };
};

export const useWalletAction = () => {
  const { dispatch } = useStoreContext();
  return (wallet) => {
    dispatch({
      type: actionType.SET_WALLET,
      payload: wallet,
    });
  };
};
