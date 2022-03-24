import React, { ReactNode, useEffect } from 'react';
import { GageProvider } from '../Provider/GageProvider';
import { AlertProvider } from '../Provider/AlertProvider';
import { initializeCron } from '../../controllers';

type AppProviderProps = {
  children: ReactNode;
};

const AppProvider = ({ children }: AppProviderProps): JSX.Element => {
  useEffect(() => {
    (async () => {
      await initializeCron();
    })();
  }, []);

  return (
    <GageProvider>
      <AlertProvider>{children}</AlertProvider>
    </GageProvider>
  );
};

export default AppProvider;
