import type { NextPage } from 'next';
import AppProvider from '../components/App/AppProvider';
import App from '../components/App/App';

const Home: NextPage = () => {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
};

export default Home;
