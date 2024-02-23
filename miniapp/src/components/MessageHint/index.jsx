import React, { useEffect, useState, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import { useBotAction, useStoreState, useUserAction } from '../../hooks/store';
import { isTimeExpire } from '../../utils/validator';
import Taro from '@tarojs/taro';
import appService from "../../services/app";
import { OK_STATUS } from "../../constants/statusCode";
import styles from './index.module.scss';
import { AtButton } from 'taro-ui';

const Message = (props) => {
  const { msg, onClick, text} = props;
  return (
    <View className={styles.msgHint}>
      <Text className={styles.msgText}>{msg}</Text>
      {
        text ? (
          <AtButton
            onClick={onClick}
            type="primary"
            size="small"
            className={styles.btn}
          >
            {text}
          </AtButton>
        ) : null
      }
    </View>
  );
};

const StatusMessage = props => {
  const { status, setCurrentTab, user, bot, openInputModal } = props;
  const botAction = useBotAction();

  if (!status) {
    return null;
  }

  const { vip_expiration } = user?.wallet ?? {};
  const isExpire = isTimeExpire(vip_expiration);
  let message;
  switch (status) {
    case "offline":
      message = {
        msg: "挂卡已离线, 具体请查看服务日志, 按照日志提示操作",
        text: "查看服务日志",
        onClick: () => {
          setCurrentTab(3);
        },
      };
      break;
    case "online":
      message = {
        msg: '挂卡已全部完成',
      };
      break;
    case "paused":
      message = {
        msg: "挂卡已暂停，是否继续?",
        text: "继续挂卡",
        onClick: async () => {
          const res =await appService.resumeBot();
          if (res?.data) {
            Taro.atMessage({
              message: '恢复挂卡成功',
              type: 'success',
            });
            botAction(res?.data);
            return;
          }
          Taro.atMessage({
            message: res?.message ?? '应用服务异常',
            type: "error"
          });
        }
      };
      break;
    case "stopped":
      if (isExpire) {
        message = {
          msg: "VIP已过期，请使用硬币兑换VIP,重新开始挂卡",
          text: "前往兑换",
          onClick: () => {
            Taro.navigateTo({
              url: '/pages/exchangeCenter/index',
            })
          }
        }
      } else if (!user?.steam) {
        message = {
          msg: "你还没有配置Steam，是否配置?",
          text: "配置Steam",
          onClick: () => {
            setCurrentTab(1);
          },
        };
      } else {
        message = {
          msg: "挂卡已停止，是否开始挂卡?",
          text: "开始挂卡",
          onClick: async () => {
            if (bot.requiredInput > 0) {
              openInputModal(true);
              return;
            }
            const res = await appService.startBot();
            if (res?.data) {
              Taro.atMessage({
                message: '开始挂卡成功',
                type: "success"
              });
              botAction(res?.data);
              return;
            }
            if (res?.code !== OK_STATUS) {
              Taro.atMessage({
                message: res?.message ?? '应用服务异常',
                type: "error"
              });
            }
          },
        };
      }
      break;
  }

  return (
    <Message {...message} />
  );
};

const MessageHint = (props) => {
  const { user, bot } = useStoreState();
  return <StatusMessage {...props} user={user} bot={bot} />
};

export default React.memo(MessageHint);
