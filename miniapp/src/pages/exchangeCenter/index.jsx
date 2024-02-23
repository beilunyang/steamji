import React, { useCallback, useState } from "react";
import Taro from '@tarojs/taro';
import { View, Text, Image } from "@tarojs/components";
import dayjs from "dayjs";
import styles from "./index.module.scss";
import { useStoreState, useWalletAction } from "../../hooks/store";
import { isTimeExpire } from "../../utils/validator";
import { AtButton, AtMessage } from "taro-ui";
import classNames from "classnames";
import appService from "../../services/app";
import { useGetVipCards } from "../../hooks/fetcher";

const ExchangeCenter = props => {
  const { user } = useStoreState();
  const vipCards = useGetVipCards();
  const [selectedCardIdx, setSelectedCardIdx] = useState(-1);
  const { vip_expiration, coin } = user?.wallet ?? {};
  const walletAction = useWalletAction();
  const isExpire = isTimeExpire(vip_expiration);
  const cards = vipCards.map(({ attributes: { name, coin } }, idx) => {
    const cls = classNames({
      [styles.pack]: true,
      [styles.active]: selectedCardIdx === idx
    });
    return (
      <View
        key={name}
        className={cls}
        onClick={() => setSelectedCardIdx(selectedCardIdx === idx ? -1 : idx)}
      >
        <Text>{name}</Text>
        <Text className={styles.packCoin}>{coin}积分</Text>
      </View>
    );
  });
  const onExchange = useCallback(() => {
    console.log('selectedCardIdx:', selectedCardIdx);
    const card = vipCards[selectedCardIdx];
    appService.exchangeVip(card.id).then(res => {
      if (res?.data) {
        Taro.atMessage({
          message: '兑换成功',
          type: 'success',
        });
        walletAction(res.data);
        return;
      }
      Taro.atMessage({
        message: '兑换失败:' + res.message,
        type: 'error',
      });
    });
  }, [selectedCardIdx]);
  return (
    <>
      <View className={styles.header}>
        <View className={styles.row}>
          <Image
            className={styles.logo}
            src={user?.avatar || require("../../assets/default_logo.png")}
            webp
          />
          <View className={styles.profileInfo}>
            <View className={styles.profileName}>
              <Text style={{color: !isExpire ? '#eb1212' : '#fff'}}>{user?.username}</Text>
              {!isExpire ? (
                <Image
                  src={require("../../assets/vip.svg")}
                  svg
                  className={styles.vipIcon}
                />
              ) : null}
            </View>
            <Text className={styles.profileVipTime}>
              {isExpire
                ? "VIP已过期"
                : `VIP过期时间: ${dayjs(vip_expiration).format("YYYY-MM-DD")}`}
            </Text>
          </View>
        </View>
        <View className={styles.row}>
          <Image
            className={styles.coinIcon}
            src={require("../../assets/coin.svg")}
            svg
          />
          <Text>{coin ?? 0}</Text>
        </View>
      </View>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>兑换VIP时长</Text>
        <View className={styles.sectionMain}>{cards}</View>
        {
          vipCards?.length > 0 && (
            <AtButton
              type='primary'
              size='small'
              disabled={selectedCardIdx === -1}
              onClick={onExchange}
            >
              立即兑换
            </AtButton>
          )
        }
      </View>
      <AtMessage duration={6000} />
    </>
  );
};

export default React.memo(ExchangeCenter);
