import { useEffect } from 'react';
import { useStore,  StoreContext, useBotAction } from './hooks/store';
import { useLogin } from './hooks/auth';
import { BotStatusManager } from './utils/manager';
import './app.scss'

const App = (props) => {
  useLogin();
  const botAction = useBotAction();
  useEffect(() => {
    new BotStatusManager(botAction);
  }, []);
  return props.children;
};

export default (props) => {
  const store = useStore();
  return (
    <StoreContext.Provider value={store}>
      <App {...props} />
    </StoreContext.Provider>
  );
};
