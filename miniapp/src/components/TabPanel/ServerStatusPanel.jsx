import { View, Text, ScrollView, Image } from '@tarojs/components';
import { pxTransform } from '@tarojs/taro';
import React, { useEffect, useCallback, useState } from 'react';
import { useServerLogsAction, useStoreState } from '../../hooks/store';
import appService from '../../services/app';
import styles from './index.module.scss';
import dayjs from 'dayjs';
import classNames from 'classnames';

const renderRow = ({ type, created_time, content }) => {
  if (type === 'empty') {
    return (
      <View className={styles.emptyLog}>
        <Text>暂无日志</Text>
      </View>
    );
  }
  const time = dayjs(created_time);
  const today = dayjs();
  const isToday = time.isSame(today, 'day');
  const thisYear = time.isSame(today, 'year');
  let ft = 'YYYY-MM-DD HH:mm:ss';
  let typeColor = '#10DE62';
  if (isToday) {
    ft = 'HH:mm:ss';
  } else if (thisYear) {
    ft = 'MM-DD HH:mm:ss'
  }
  if (type === 'WARN') {
    typeColor = '#EFCC17';
  }
  if (type === 'ERROR') {
    typeColor = '#EB1212';
  }
  return (
    <View className={styles.logItem}>
      <Text className={styles.logTime}>{`[${time.format(ft)}]`}</Text>
      <Text className={styles.logType} style={{ color: typeColor }}>{type}</Text>
      <Text className={styles.logLabel}>{'>'}</Text>
      <Text>{content}</Text>
    </View>
  );
}

const ServerStatusPanel = (props) => {
  const {
    serverLogs,
  } = useStoreState();
  const { current } = props;
  const [isRefresh, setRefresh] = useState(false);
  const serverLogsAction = useServerLogsAction();
  const getLog = useCallback(() => {
    appService.getBotLog()
      .then((res) => {
        if (res?.results?.length > 0) {
          serverLogsAction(res);
        }
      });
  }, []);

  const onClick = useCallback(() => {
    if (isRefresh) {
      return;
    }
    setRefresh(true);
    setTimeout(() => {
      setRefresh(false);
    }, 1500);
    getLog();
  }, []);
  useEffect(() => {
    if (current == 3) {
      getLog();
    }
  }, [current]);
  const cls = classNames({
    [styles.refreshIcon]: true,
    [styles.rotate]: isRefresh,
  });
  const data = serverLogs?.length > 0 ? serverLogs : [{ type: 'empty' }];
  return (
    <View className={styles.panel}>
      <View className={styles.runStatusRow}>
        <View className={styles.column}>
          <Text className={styles.panelTitle}>应用服务日志</Text>
          <Text className={styles.panelSubTitle}>日志非实时，请点击刷新按钮手动刷新</Text>
        </View>
        <Image
          onClick={onClick}
          src={require('../../assets/refresh.svg')} className={cls} />
      </View>
      <ScrollView
        scrollY
        className={styles.serverLog}
        style={{ height: pxTransform(500) }}
      >
        {data.map((item) => renderRow(item))}
      </ScrollView>
    </View>
  );
};

export default React.memo(ServerStatusPanel);
