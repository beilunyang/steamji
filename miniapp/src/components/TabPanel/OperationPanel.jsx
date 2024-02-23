import React from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import RunStatusRow from './RunStatusRow';
import styles from './index.module.scss';
import appService from '../../services/app';
import { OK_STATUS } from '../../constants/statusCode';
import { useBotAction, useStoreState } from '../../hooks/store';
import { BotStatusManager } from '../../utils/manager';
import classNames from 'classnames';

const OperationPanel = (props) => {
  const { openInputModal, showContact } = props;
  const { bot, user } = useStoreState();
  let {
    status,
    requiredInput,
    statusText = '已停止',
  } = bot || {};
  const botAction = useBotAction();
  const grid = React.useMemo(() => {
    const common = [
      {
        icon: 'card',
        name: '开始挂卡',
        status: 'stopped',
        onClick: async () => {
          console.log('requiredInput:', requiredInput);
          if (requiredInput > 0) {
            openInputModal(true);
            return;
          }
          const res = await appService.startBot();
          if (res?.code === OK_STATUS) {
            Taro.atMessage({
              message: '开始挂卡成功',
              type: 'success',
            });
            botAction(res.data);
          } else {
            Taro.atMessage({
              message: `开始挂卡失败,原因: ${res?.message ?? '未知'}`,
              type: 'error',
            });
          }
          BotStatusManager?.instance?.refresh?.();
        },
      },
      {
        icon: 'pause',
        name: '暂停挂卡',
        status: 'online',
        onClick: async () => {
          const res = await appService.pauseBot();
          if (res?.code === OK_STATUS) {
            Taro.atMessage({
              message: '暂停挂卡成功',
              type: 'success',
            });
            botAction(res.data);
          } else {
            Taro.atMessage({
              message: `暂停挂卡失败,原因: ${res?.message ?? '未知'}`,
              type: 'error',
            });
          }
          BotStatusManager?.instance?.refresh?.();
        },
      },
      {
        icon: 'time',
        name: '恢复挂卡',
        status: 'paused',
        onClick: async () => {
          const res = await appService.resumeBot();
          if (res?.code === OK_STATUS) {
            Taro.atMessage({
              message: '恢复挂卡成功',
              type: 'success',
            });
            botAction(res.data);
          } else {
            Taro.atMessage({
              message: `恢复挂卡失败,原因: ${res?.message ?? '未知'}`,
              type: 'error',
            });
          }
          BotStatusManager?.instance?.refresh?.();
        },
      },
      {
        icon: 'stop',
        name: '终止挂卡',
        status: 'online',
        onClick: async () => {
          const res = await appService.stopBot();
          if (res?.code === OK_STATUS) {
            Taro.atMessage({
              message: '终止挂卡成功',
              type: 'success',
            });
            botAction(res.data);
          } else {
            Taro.atMessage({
              message: `终止挂卡失败,原因: ${res?.message ?? '未知'}`,
              type: 'error',
            });
          }
          BotStatusManager?.instance?.refresh?.();
        },
      },
    ];
    if (showContact) {
      common.push({
        icon: 'contact',
        name: '联系我们',
        onClick: props.onContact,
      })
    }
    return common
  }, [user, requiredInput, showContact]);
  const isRunning = status === 'farming' || status === 'online';
  const isPaused = status === 'paused';
  const style = {
    "--bot-status-color":
    isRunning ? "#10DE62" : (isPaused ? "#EFCC17" : "#EB1212")
  };
  return (
    <View style={style} className={styles.operationPanel}>
      <RunStatusRow statusText={statusText} />
      <View className={styles.gridPanel}>
        {
          grid.map((item) => {
            if (status === 'farming') {
              status = 'online';
            }
            const disabled = item.status && status !== item.status;
            const img = disabled ? require(`../../assets/${item.icon}_disabled.svg`) : require(`../../assets/${item.icon}.svg`);
            const cls = classNames({
              [styles.gridItem]: true,
              [styles.disabled]: disabled,
            });
            const onClick = !disabled && item.onClick;
            return (
              <View className={cls} onClick={onClick} key={item.name}>
                <Image
                  className={styles.gridItemIcon}
                  src={img}
                />
                <Text>{item.name}</Text>
              </View>
            );
          })
        }
      </View>
    </View>
  );
};

export default React.memo(OperationPanel);
