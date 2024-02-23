import React, { useCallback } from "react";
import { View, Text, Image, Form, Button } from "@tarojs/components";
import Taro, { useShareAppMessage, useShareTimeline } from "@tarojs/taro";
import { useCheckinAction, useStoreState, useTaskAction, useUserAction, useWalletAction } from "../../hooks/store";
import styles from "./index.module.scss";
import appService from "../../services/app";
import { OK_STATUS } from "../../constants/statusCode";
import { useFindCheckinInfo } from "../../hooks/fetcher";

Form;

let shareType = "share";

const taskGroup = [
  {
    title: "每日任务",
    tasks: [
      {
        icon: "qiandao",
        text: "签到",
        // desc: "（连续7天以上奖励翻倍）",
        reward: 10,
        action: {
          title: "签到",
          onClick: async (updater) => {
            const res = await appService.checkin();
            if (res.code === OK_STATUS) {
              updater(res.data);
            }
          },
          isFinish: (state) => {
            if (state.isCheckin) {
              return '今日已签到';
            }
          },
        }
      },
      {
        icon: "share",
        text: "分享小程序",
        reward: 10,
        action: {
          title: "分享",
          openType: "share",
          onClick: () => {
            shareType = "share";
          },
          isFinish: (state) => {
            if (state.isShared) {
              return '已分享';
            }
          },
        }
      },
      {
        icon: "invite",
        text: "邀请好友注册",
        reward: 100,
        action: {
          title: "邀请",
          openType: "share",
          onClick: () => {
            shareType = "invite";
          },
        }
      }
    ]
  },
  {
    title: "新手任务",
    tasks: [
      {
        icon: "steam",
        text: "配置Steam账号",
        reward: 50,
        action: {
          title: "去配置",
          onClick: () => {
            Taro.reLaunch({
              url: "/pages/home/index?tab=1"
            });
          },
          isFinish: (state) => {
            return state.isBinded && '已配置';
          },
        }
      }
    ]
  }
];

const TaskCenter = props => {
  useFindCheckinInfo();
  const { invite_code, user, checkin } = useStoreState();
  const walletAction = useWalletAction();
  const taskAction = useTaskAction();
  const checkinAction = useCheckinAction();
  const userAction = useUserAction();
  const onShare = useCallback(() => {
    if (shareType === "invite") {
      return {
        title: "你的好友邀请你使用蒸汽姬云挂卡",
        path: "/pages/home/index?from=invite&invite_code=" + invite_code
      };
    }
    appService.finishShareTask().then((res) => {
      if (res.code === OK_STATUS) {
        walletAction({ coin: res.data.coin });
        taskAction({
          type: 'share',
          finished: true,
        });
      }
    });
    return {
      title: "蒸汽姬云挂卡|24小时免费云挂卡服务",
      path: "/pages/home/index?from=share",
    };
  }, []);
  useShareAppMessage(onShare);
  useShareTimeline(onShare);
  const content = taskGroup.map(group => {
    const tasks = group.tasks.map(task => {
      const finishTitle = task.action?.isFinish?.({
        isBinded: user?.task?.bind_steam_task_finished,
        isShared: user?.task?.share_task_finished,
        isCheckin: checkin.isCheckin,
      });
      return (
        <View className={styles.task}>
          <View className={styles.row}>
            <Image
              src={require(`../../assets/${task.icon}.svg`)}
              svg
              className={styles.taskIcon}
            />
            <View className={styles.column}>
              <View className={styles.row}>
                <Text>{task.text}</Text>
                <Text className={styles.taskDesc}>{task.desc}</Text>
              </View>
              <Text className={styles.taskReward}>+{task.reward}B</Text>
            </View>
          </View>
          <Button
            type="primary"
            size="small"
            disabled={!!finishTitle}
            openType={task.action.openType}
            onClick={task.action.onClick.bind(null, (data) => {
              checkinAction(data.checkin);
              userAction({ wallet: data.wallet });
            })}
            className={styles.btn}
          >
            {finishTitle || task.action.title}
          </Button>
        </View>
      );
    });
    return (
      <View className={styles.group}>
        <Text className={styles.groupTitle}>{group.title}</Text>
        <View className={styles.tasks}>{tasks}</View>
      </View>
    );
  });

  return (
    <>
      <View className={styles.header}>
        <View className={styles.column}>
          <Text className={styles.text}>做任务赚硬币</Text>
          <Text className={styles.secondaryText}>硬币可以兑换VIP权益哦~</Text>
        </View>
        <View className={styles.row}>
          <Image
            className={styles.coinIcon}
            src={require("../../assets/coin.svg")}
            svg
          />
          <Text>{user?.wallet?.coin ?? 0}</Text>
        </View>
      </View>
      {content}
    </>
  );
};

export default React.memo(TaskCenter);
