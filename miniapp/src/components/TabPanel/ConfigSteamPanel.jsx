import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import _ from 'lodash-es';
import { View, Text, Picker } from '@tarojs/components'
import { AtInput, AtButton } from 'taro-ui'
import appService from '../../services/app';
import styles from './index.module.scss';
import { useStoreState, useUserAction } from '../../hooks/store';

const statusRange = [{
  key: '离线(不显示游戏状态)',
  value: 'offline',
}, {
  key: '在线(显示正在xx游戏)',
  value: 'online',
}];

const ConfigSteamPanel = (props) => {
  const [status, setStatus] = useState(0);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [sign, setSign] = useState('');
  const [pin, setPin] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const { user } = useStoreState();
  const steam = user?.steam;
  const userAction = useUserAction();
  useEffect(() => {
    if (steam) {
      setStatus(statusRange.findIndex((status) => status.value === steam.online_status));
      setName(steam.name);
      setSign(steam.sign);
      setPin(steam.pin);
    }
  }, [steam]);
  const onSubmit = async () => {
    if (name.length === 0) {
      setUsernameError(true);
      Taro.atMessage({
        message: '账户名不能为空',
        type: 'error',
      });
      return;
    }
    if (!steam?.id && password.length === 0) {
      setPasswordError(true);
      Taro.atMessage({
        message: '密码不能为空',
        type: 'error',
      });
      return;
    }
    const newSteamData = _.omitBy({
      name,
      password,
      sign,
      pin,
      online_status: statusRange[status].value,
    }, _.isEmpty);
    const steamValues = _.omitBy(steam, (_, key) => key === 'id');
    const isSame = _.isEqual(newSteamData, steamValues);
    if (isSame) {
      Taro.atMessage({
        message: '无需更新',
        type: 'info',
      });
      return;
    }
    const res = await appService.createOrUpdateBot(newSteamData);
    if (res?.data) {
      userAction({
        steam: res.data.steam,
        wallet: res.data.wallet,
        task: {
          bind_steam_task_finished: true,
        },
      });
      Taro.atMessage({
        message: '保存成功',
        type: 'success',
      });
      return;
    }
    Taro.atMessage({
      message: '保存失败',
      type: 'error',
    });
  };
  return (
    <View className={styles.panel}>
      <View className={styles.formItem}>
        <Text>账号信息</Text>
        <AtInput
          placeholder="请输入Steam账号名"
          className={styles.formAtInput}
          value={name}
          error={usernameError}
          onChange={setName}
        />
        <AtInput
          placeholder="请输入Steam密码"
          className={styles.formAtInput}
          value={password}
          error={passwordError}
          type="password"
          onChange={setPassword}
        />
      </View>
      <View className={styles.formItem}>
        <Text className={styles.formLabel}>在线状态</Text>
        <Picker
          mode="selector"
          rangeKey="key"
          value={{status}}
          range={statusRange}
          onChange={(evt) => setStatus(evt.detail.value)}
        >
          <View className={styles.formInput}>{statusRange[status]?.key}</View>
        </Picker>
      </View>
      <View className={styles.formItem}>
        <Text className={styles.formLabel}>个性签名</Text>
        <AtInput
          placeholder="例如: 挂机请勿打扰 (可不填)"
          className={styles.formAtInput}
          value={sign}
          onChange={setSign}
        />
      </View>
      <View className={styles.formItem}>
        <Text className={styles.formLabel}>是否开启了家庭监护?</Text>
        <AtInput
          placeholder="家庭监护PIN码(没有可不填)"
          className={styles.formAtInput}
          value={pin}
          onChange={setPin}
        />
      </View>
      <AtButton
        type="primary"
        size="small"
        onClick={onSubmit}
      >保存</AtButton>
    </View>
  );
};

export default React.memo(ConfigSteamPanel);
