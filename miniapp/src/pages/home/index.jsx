import React from "react";
import { useShareAppMessage } from "@tarojs/taro";
import { AtMessage, AtNoticebar } from "taro-ui";
import { View } from "@tarojs/components";
import styles from "./index.module.scss";
import TabPanel from "../../components/TabPanel";
import Profile from "../../components/Profile";
import Entry from "../../components/Entry";
import { useGetNotification } from "../../hooks/fetcher";

const Home = () => {
  const notification = useGetNotification();
  useShareAppMessage(() => {
    return {
      title: "蒸汽姬云挂卡|24小时免费云挂卡服务",
      path: "/pages/home/index?from=share"
    };
  });
  return (
    <View className={styles.container}>
      {notification && (
        <AtNoticebar icon='volume-plus'>{notification}</AtNoticebar>
      )}
      <Profile />
      <Entry />
      <TabPanel />
      <AtMessage duration={6000} />
    </View>
  );
};

export default React.memo(Home);
