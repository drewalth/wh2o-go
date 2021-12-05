import { Navigation } from '../components/Common/Navigation'
import { Layout, Menu } from 'antd'
import { useState } from 'react'
import { ClimbingArea, Alert } from '../components/Climb'
import { ClimbProvider } from '../components/Provider/ClimbProvider/ClimbProvider'
const { Content, Sider } = Layout
type Tab = '1' | '2'
const Climb = () => {
  const [selectedTab, setSelectedTab] = useState<Tab>('1')
  return (
    <Navigation>
      <ClimbProvider>
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
              <Menu.Item key="1">Climbing Areas</Menu.Item>
              <Menu.Item key="2">Alerts</Menu.Item>
            </Menu>
          </Sider>
          <Content style={{ padding: '24px', minHeight: 500 }}>
            {selectedTab === '1' && <ClimbingArea />}
            {selectedTab === '2' && <Alert />}
          </Content>
        </Layout>
      </ClimbProvider>
    </Navigation>
  )
}

export default Climb
