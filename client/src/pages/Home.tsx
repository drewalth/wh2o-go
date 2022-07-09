import { Navigation } from '../components/Common/Navigation'
import { Layout, Menu } from 'antd'
import { Gage } from '../components/Gage/Gage'
import { Alert } from '../components/Alert/Alert'
import { useState } from 'react'
import AppProvider from '../components/App/AppProvider'

type Tab = '1' | '2'

const { Content, Sider } = Layout

const Home = () => {
  const [selectedTab, setSelectedTab] = useState<Tab>('1')

  return (
    <AppProvider>
      <Navigation>
        <Layout
          className="site-layout-background"
          style={{ padding: '0', background: '#fff' }}
        >
          <Sider width={200}>
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              style={{ height: '100%' }}
              onSelect={({ key }) => setSelectedTab(key as Tab)}
            >
              <Menu.Item key="1">Gages</Menu.Item>
              <Menu.Item key="2">Alerts</Menu.Item>
            </Menu>
          </Sider>
          <Content style={{ padding: '24px', minHeight: 500 }}>
            {selectedTab === '1' && <Gage />}
            {selectedTab === '2' && <Alert />}
          </Content>
        </Layout>
      </Navigation>
    </AppProvider>
  )
}

export default Home
