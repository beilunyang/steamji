import React, { useCallback, useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import classNames from 'classnames';
import { BotStatusManager } from '../../utils/manager';

const RunStatusRow = (props) => {
  const [isRefresh, setRefresh] = useState(false);
  const { statusText } = props;
  const onClick = useCallback(() => {
    if (isRefresh) {
      return;
    }
    setRefresh(true);
    setTimeout(() => {
      setRefresh(false);
    }, 1500);
    BotStatusManager?.instance?.getBotStatus?.();
  }, []);
  const cls = classNames({
    [styles.refreshIcon]: true,
    [styles.rotate]: isRefresh,
  });
  return (
    <View className={styles.runStatusRow}>
      <View>
        <Text className={styles.runStatusText}>当前运行状态:</Text>
        <Text className={styles.labelSuccess}>{statusText}</Text>
      </View>
      <Image
        svg
        src={require("../../assets/refresh.svg")}
        className={cls}
        onClick={onClick}
      />
    </View>
  );
}

export default React.memo(RunStatusRow);
