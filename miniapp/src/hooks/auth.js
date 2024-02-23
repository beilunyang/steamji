import { useEffect } from "react";
import { OK_STATUS } from "../constants/statusCode";
import authService from "../services/auth";
import http from '../services/http';
import { useJWTAction, useUserAction } from "./store";

export const useLogin = () => {
  const userAction = useUserAction();
  const jwtAction = useJWTAction();
  useEffect(() => {
    http.init().then(() => {
      authService.login().then((res) => {
        if (res.code === OK_STATUS) {
          userAction(res.data.user);
          jwtAction(res.data.jwt);
        }
      })
    });
  }, []);
};
