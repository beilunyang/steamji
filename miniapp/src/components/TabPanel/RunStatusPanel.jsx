import React from "react";
import { View, Text, Image } from "@tarojs/components";
import styles from "./index.module.scss";
import { useStoreState } from "../../hooks/store";
import RunStatusRow from "./RunStatusRow";
import MessageHint from "../MessageHint";

const FarmInfo = props => {
  const { gamesToFarm = [], currentGamesFarming = [] } = props;
  const cardsRemaining = gamesToFarm.reduce(
    (total, game) => (total += game.CardsRemaining),
    0
  );
  return (
    <>
      <View className={styles.farmRow}>
        <Text>可挂卡游戏数:</Text>
        <View>
          <Text className={styles.farmVal}>{gamesToFarm.length}</Text>
          <Text>款</Text>
        </View>
      </View>
      <View className={styles.farmRow}>
        <Text>未掉落卡牌数:</Text>
        <View>
          <Text className={styles.farmVal}>{cardsRemaining}</Text>
          <Text>张</Text>
        </View>
      </View>
      <View className={styles.farmTitle}>
        <Text>以下游戏可挂卡</Text>
      </View>
      <View className={styles.farmGames}>
        {gamesToFarm.map(game => {
          const { GameName, AppID } = game;
          const entity = currentGamesFarming.find(
            currentGame => currentGame.AppID === AppID
          );
          return (
            <View className={styles.farmGame}>
              <Image
                src={`https://steamcdn-a.akamaihd.net/steam/apps/${AppID}/header.jpg`}
                className={styles.farmGameCover}
              />
              <Text className={styles.farmGameName}>{GameName}</Text>
              <View className={styles.flag} />
            </View>
          );
        })}
      </View>
    </>
  );
};

const RunStatusPanel = props => {
  const { bot } = useStoreState();
  const {
    status,
    statusText = "已停止",
    gamesToFarm,
    currentGamesFarming
  } = bot || {};
  const { setCurrentTab, openInputModal } = props;
  const style = {
    "--bot-status-color":
      status === "farming" || status === "online" ? "#10DE62" : (status === 'paused' ? "#EFCC17" : "#EB1212")
  };
  return (
    <View className={styles.panel} style={style}>
      <RunStatusRow statusText={statusText}/>
      {status === "farming" ? (
        <FarmInfo
          gamesToFarm={gamesToFarm}
          currentGamesFarming={currentGamesFarming}
        />
      ) : (
        <MessageHint
          status={status}
          setCurrentTab={setCurrentTab}
          openInputModal={openInputModal}
        />
      )}
    </View>
  );
};

export default React.memo(RunStatusPanel);
