import React, { ReactNode, useEffect, useState } from 'react';
import { GageContext } from './GageContext';
import { Gage, GageEntry } from '../../../types';
import { getGages, getGageSources } from '../../../controllers';
import io, { Socket } from 'socket.io-client';
import { notification } from 'antd';

type GageProviderProps = {
  children: ReactNode;
};

let socket: undefined | Socket;

export const GageProvider = ({ children }: GageProviderProps): JSX.Element => {
  const [gages, setGages] = useState<Gage[]>([]);
  const [gageSources, setGageSources] = useState<GageEntry[]>([]);

  const loadGages = async () => {
    try {
      const result = await getGages();
      setGages(result);
    } catch (e) {
      notification.error({
        message: 'Failed to load gages',
        placement: 'bottomRight',
      });
    }
  };

  const loadGageSources = async (state: string) => {
    try {
      const {
        sources: { gages },
      } = await getGageSources(state);
      setGageSources(gages);
    } catch (e) {
      notification.error({
        message: 'Failed to gage sources',
        placement: 'bottomRight',
      });
    }
  };

  useEffect(() => {
    (async () => {
      await loadGages();
      await fetch('/api/socket');
      socket = io();

      socket.on('gagesUpdated', async () => {
        await loadGages();
        notification.info({
          message: 'Gages refreshed',
          placement: 'bottomRight',
        });
      });
    })();
  }, []);

  return (
    <GageContext.Provider
      value={{
        gages,
        gageSources,
        loadGageSources,
        loadGages,
      }}
    >
      {children}
    </GageContext.Provider>
  );
};
