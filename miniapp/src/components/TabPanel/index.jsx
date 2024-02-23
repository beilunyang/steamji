import React, { useState } from "react";
import { View } from "@tarojs/components";
import { useRouter } from "@tarojs/taro";
import { AtTabs, AtTabsPane, AtModal } from "taro-ui";
import { useBotInfo, useGetConnectUS } from "../../hooks/fetcher";
import RunStatusPanel from "./RunStatusPanel";
import ConfigSteamPanel from "./ConfigSteamPanel";
import ServerStatusPanel from "./ServerStatusPanel";
import styles from "./index.module.scss";
import OperationPanel from "./OperationPanel";
import InputModal from "../InputModal";
import { useStoreState } from "../../hooks/store";

const tabs = [
  {
    title: "运行状态"
  },
  {
    title: "配置Steam"
  },
  {
    title: "快捷操作"
  },
  {
    title: "服务器状态"
  }
];

const TabPanels = props => {
  const {
    params: { tab = 0 }
  } = useRouter();
  const { bot } = useStoreState();
  const [currentTab, setCurrentTab] = useState(Number(tab));
  const [isOpenedModal, openModal] = useState(false);
  const [isOpenedInputModal, openInputModal] = useState(false);
  useBotInfo([currentTab]);
  const connectMsg = useGetConnectUS()
  return (
    <View className={styles.container}>
      <AtTabs
        current={currentTab}
        tabList={tabs}
        onClick={setCurrentTab}
        className={styles.tabs}
      >
        <AtTabsPane current={currentTab} index={0}>
          <RunStatusPanel
            setCurrentTab={setCurrentTab}
            openInputModal={openInputModal}
          />
        </AtTabsPane>
        <AtTabsPane current={currentTab} index={1}>
          <ConfigSteamPanel />
        </AtTabsPane>
        <AtTabsPane current={currentTab} index={2}>
          <OperationPanel
            showContact={connectMsg}
            onContact={() => openModal(true)}
            openInputModal={openInputModal}
          />
        </AtTabsPane>
        <AtTabsPane current={currentTab} index={3}>
          <ServerStatusPanel current={currentTab} />
        </AtTabsPane>
      </AtTabs>
      <AtModal
        isOpened={isOpenedModal}
        title='联系我们'
        content={connectMsg}
        confirmText='确认'
        onConfirm={() => openModal(false)}
        onClose={() => openModal(false)}
      />
      <InputModal
        isOpened={isOpenedInputModal}
        requiredInput={bot?.requiredInput}
        openModal={openInputModal}
      />
    </View>
  );
};

export default React.memo(TabPanels);
