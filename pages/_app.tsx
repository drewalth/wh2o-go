import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { initializeCron } from '../controllers';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    (async () => {
      await initializeCron();
    })();
  }, []);
  return <Component {...pageProps} />;
}

export default MyApp;
