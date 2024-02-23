import React from 'react';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import { View, Text, Image, Button } from '@tarojs/components'
import { useShowLoginModalAction, useStoreState, useMiniappProfileAction } from '../../hooks/store';
import LoginModal from '../LoginModal';
import { isTimeExpire } from '../../utils/validator';

const LoginButton = () => {
  const { miniappProfile } = useStoreState();
  const miniappProfileAction = useMiniappProfileAction();
  const showLoginModalAction = useShowLoginModalAction();
  const onToLogin = async () => {
    if (!miniappProfile) {
      await miniappProfileAction();
    }
    showLoginModalAction(true);
  };
  if (process.env.TARO_ENV === 'weapp') {
    return (
      <View className={styles.profileInfo} onClick={onToLogin}>
        <Text className={styles.linkColor}>请点击登录</Text>
        <Text className={styles.profileVipTime}>微信用户可快捷登录</Text>
      </View>
    )
  }
  const onGetUserInfo = async ({ detail: { userInfo }}) => {
    if (!miniappProfile) {
      await miniappProfileAction(userInfo)
    }
    showLoginModalAction(true)
  };
  return miniappProfile ? (
    <View className={styles.profileInfo} onClick={onGetUserInfo}>
      <Text className={styles.linkColor}>请点击登录</Text>
      <Text className={styles.profileVipTime}>QQ用户可快捷登录</Text>
    </View>
  ) : (
    <Button openType='getUserInfo' plain onGetUserInfo={onGetUserInfo} className={styles.profileInfo}>
      <Text className={styles.linkColor}>请点击登录</Text>
      <Text className={styles.profileVipTime}>QQ用户可快捷登录</Text>
    </Button>
  )
}

const Profile = () => {
  const { user } = useStoreState();
  const { vip_expiration, coin } = user?.wallet ?? {};
  const isExpire = isTimeExpire(vip_expiration);
  return (
    <View className={styles.profile}>
      <View className={styles.profileMain}>
        <Image
          src={user?.avatar || require('../../assets/default_logo.png')}
          className={styles.logo}
          webp
        />
        {
          user ? (
            <View className={styles.profileInfo}>
              <View className={styles.profileName}>
                <Text style={{color: !isExpire ? '#eb1212' : '#333'}}>{user.username}</Text>
                {
                  !isExpire ? (
                    <Image src={require('../../assets/vip.svg')} svg className={styles.vipIcon} />
                  ) : null
                }
              </View>
              <Text className={styles.profileVipTime}>
                {
                  isExpire ? "VIP已过期" : `VIP过期时间: ${dayjs(vip_expiration).format('YYYY-MM-DD')}`
                }
              </Text>
            </View>
          ) : <LoginButton />
        }
      </View>
      {
        user ? (
          <View className={styles.profileCoin}>
            <Text>{coin}</Text>
            <Text className={styles.profileUnit}>硬币</Text>
          </View>
        ) : null
      }
      <LoginModal />
    </View>
  );
}

export default React.memo(Profile);
