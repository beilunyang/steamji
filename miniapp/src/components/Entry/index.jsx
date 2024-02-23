import React from 'react';
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const Entry = () => {
  return (
    <View className={styles.entries}>
      <View className={styles.entry} onClick={() => {
        Taro.navigateTo({
          url: '/pages/taskCenter/index',
        });
      }}>
        <Image src={require('../../assets/task.svg')} svg  className={styles.entryIcon}/>
        <View className={styles.entryMain}>
          <Text>今日任务</Text>
          <Text className={styles.entrySubTitle}>做任务得硬币</Text>
        </View>
      </View>
      <View className={styles.entry} onClick={() => {
        Taro.navigateTo({
          url: '/pages/exchangeCenter/index',
        });
      }}>
        <Image src={require('../../assets/shop.svg')} svg className={styles.entryIcon} />
        <View className={styles.entryMain}>
          <Text>兑换中心</Text>
          <Text className={styles.entrySubTitle}>硬币兑换VIP</Text>
        </View>
      </View>
    </View>
  );
};

export default React.memo(Entry);
