import React, { useState, useCallback, useEffect } from "react";
import Taro from '@tarojs/taro';
import { Button } from "@tarojs/components";
import {
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtInput
} from "taro-ui";
import { getUserInputLabel } from "../../utils";
import appService from "../../services/app";
import { useBotAction } from "../../hooks/store";
import { BotStatusManager } from "../../utils/manager";

const InputModal = props => {
  const { isOpened, requiredInput, openModal } = props;
  const botAction = useBotAction();
  const label = getUserInputLabel(requiredInput);
  const text = `请输入${label}`;
  const [value, setValue] = useState();
  useEffect(() => {
    if (!isOpened) {
      setValue();
    }
  }, [isOpened]);
  const onConfirm = useCallback(
    () => {
      const val = value?.trim?.();
      if (!val || val.length < 1) {
        Taro.atMessage({
          message: label + '不能为空',
          type: "error"
        });
        return;
      }
      appService
        .inputBot(requiredInput, value)
        .then(res => {
          if (res?.data) {
            return appService.startBot();
          }
        })
        .then(res => {
          openModal(false);
          if (res?.data) {
            Taro.atMessage({
              message: "开始挂卡成功",
              type: "success"
            });
            botAction(res.data);
            BotStatusManager?.instance?.refresh?.();
            return;
          }
          Taro.atMessage({
            message: `开始挂卡失败,原因: ${res?.message ?? "未知"}`,
            type: "error"
          });
          BotStatusManager?.instance?.refresh?.();
        })
    }, [value, label]
  );
  return (
    <AtModal isOpened={isOpened} closeOnClickOverlay={false}>
      <AtModalHeader>{text}</AtModalHeader>
      <AtModalContent>
        <AtInput
          name="text"
          placeholder={text}
          value={value}
          onChange={setValue}
        />
      </AtModalContent>
      <AtModalAction>
        <Button onClick={() => openModal(false)}>取消</Button>
        <Button onClick={onConfirm}>确定</Button>
      </AtModalAction>
    </AtModal>
  );
};

export default React.memo(InputModal);
