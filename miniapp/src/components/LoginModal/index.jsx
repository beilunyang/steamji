import React, { useEffect, useState } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { Button, Input } from '@tarojs/components'
import { AtInput, AtModal, AtModalAction, AtModalContent, AtModalHeader } from 'taro-ui';
import { useStoreState, useShowLoginModalAction, useUserAction, useJWTAction } from '../../hooks/store';
import { isValidEmail, isValidUsername } from '../../utils/validator';
import authService from '../../services/auth';
import { EMAIL_ERROR_STATUS, EMAIL_USERNAME_ERROR_STATUS, OK_STATUS, USERNAME_ERROR_STATUS } from '../../constants/statusCode';

// https://github.com/NervJS/taro/issues/7084
// 为了在dev模式下正常显示AtInput
Input;
//

const LoginModal = (props) => {
  const { params: { invite_code } } = useRouter();
  const { isShowLoginModal, miniappProfile } = useStoreState();
  const [ email, setEmail ] = useState('');
  const [ username, setUsername ] = useState('');
  const [ emailError, setEmailError ] = useState(false);
  const [ usernameError, setUsernameError ] = useState(false);
  const showLoginModalAction = useShowLoginModalAction();
  const userAction = useUserAction();
  const jwtAction = useJWTAction();
  const onCancel = () => {
    showLoginModalAction(false);
  };
  useEffect(() => {
    setUsername(miniappProfile?.nickName);
  }, [miniappProfile?.nickName]);
  const onLogin = async () => {
    if (!isValidEmail(email)) {
      setEmailError(true);
      Taro.atMessage({
        message: '邮箱地址不正确',
        type: 'error',
      });
      return;
    }

    if (!isValidUsername(username)) {
      setEmailError(true);
      Taro.atMessage({
        message: '用户名至少3位',
        type: 'error',
      });
      return;
    }

    const result = await authService.login({
      username: username,
      avatar: miniappProfile.avatarUrl,
      email,
      invited_by: invite_code,
    });
    if (result.code === OK_STATUS) {
      showLoginModalAction(false);
      userAction(result.data.user);
      jwtAction(result.data.jwt);
    } else {
      if (result.code === EMAIL_ERROR_STATUS) {
        setEmailError(true);
      }
      if (result.code === USERNAME_ERROR_STATUS) {
        setUsernameError(true);
      }
      if (result.code === EMAIL_USERNAME_ERROR_STATUS) {
        setEmailError(true);
        setUsernameError(true);
      }
      Taro.atMessage({
        message: result.message,
        type: 'error',
      });
    }
  };
  return (
    <AtModal
      isOpened={isShowLoginModal}
      closeOnClickOverlay={false}
    >
      <AtModalHeader>需要完善信息</AtModalHeader>
      <AtModalContent>
        <AtInput
          required
          error={emailError}
          name="email"
          placeholder="请输入邮箱地址"
          value={email}
          onChange={setEmail}
        />
        <AtInput
          error={usernameError}
          name="username"
          placeholder="请输入用户名"
          value={username}
          onChange={setUsername}
        />
      </AtModalContent>
      <AtModalAction>
        <Button onClick={onCancel}>取消</Button>
        <Button onClick={onLogin}>登录</Button>
      </AtModalAction>
    </AtModal>
  );
}

export default React.memo(LoginModal);
