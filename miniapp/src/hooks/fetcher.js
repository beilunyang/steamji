import { useState, useEffect } from 'react';
import appService from '../services/app';
import { BotStatusManager } from "../utils/manager";
import { useCheckinAction, useServerLogsAction, useStoreState } from "./store";

export const useBotInfo = (deps = []) => {
  const { jwt } = useStoreState();
  useEffect(() => {
    if (jwt) {
      BotStatusManager?.instance?.refresh?.();
    }
  }, [jwt, ...deps]);
};

export const useBotLog = () => {
  const { jwt } = useStoreState();
  const serverLogsAction = useServerLogsAction();
  useEffect(() => {
    if (jwt) {
      appService.getBotLog().then((res) => {
        if (res?.results?.length > 0) {
          serverLogsAction(res);
        }
      });
    }
  }, [jwt]);
};

export const useFindCheckinInfo = () => {
  const { jwt } = useStoreState();
  const checkinAction = useCheckinAction();
  useEffect(() => {
    if (jwt) {
      appService.findCheckinInfo().then((res) => {
        if (res.data) {
          checkinAction(res.data);
        }
      });
    }
  }, [jwt]);
};

export const useGetVipCards = () => {
  const { jwt } = useStoreState();
  const [vipCards, setVipCards] = useState([]);
  useEffect(() => {
    if (jwt) {
      appService.getVipCards().then(res => setVipCards(res));
    }
  }, [jwt]);
  return vipCards;
};

export const useGetNotification = () => {
  const [notification ,setNotification ] = useState()
  useEffect(() => {
    appService.getRemoteConfig('notification').then(res => {
      if (res.data) {
        const value = res?.data?.[0]?.attributes?.value
        if (value) {
          setNotification(value)
        }
      }
    })
  }, [])
  return notification
}

export const useGetConnectUS = () => {
  const [connect, setConnect] = useState()
  useEffect(() => {
    appService.getRemoteConfig('connect').then(res => {
      if (res.data) {
        const value = res?.data?.[0]?.attributes?.value
        if (value) {
          setConnect(value)
        }
      }
    })
  }, [])
  return connect
}
