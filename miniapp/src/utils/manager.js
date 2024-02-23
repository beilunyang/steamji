import { BOT_NOT_EXIST } from '../constants/statusCode';
import appService from '../services/app';

export class BotStatusManager {
  static instance;

  constructor(botAction, delay = 5000) {
    this.idx = 0;
    this.timer = null;
    this.isRefresh = false;
    this.botAction = botAction;
    setInterval(() => {
      if (this.idx > 0) {
        if (this.isRefresh) {
          return;
        }
        this.idx--;
        console.log('延迟getBotStauts执行');
        this.getBotStatus();
      }
    }, delay);
    BotStatusManager.instance = this;
  }

  async getBotStatus() {
    this.isRefresh = true;
    const res = await appService.getBotInfo();
    this.isRefresh = false;
    if (res?.data) {
      this.botAction(res.data);
    } else if (res?.code === BOT_NOT_EXIST) {
      this.botAction({
        status: 'stopped',
      });
    }
  }

  refresh() {
    if (!this.isRefresh && this.idx === 0) {
      console.log('立即getBotStatus执行');
      this.getBotStatus();
    }
    this.idx++;
  }
}
