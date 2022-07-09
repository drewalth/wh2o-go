import React, { ReactNode } from 'react'
import Logo from './wh2o-logo'
import { Layout, Menu, Typography } from 'antd'
import 'antd/dist/antd.css'
import {
  DashboardOutlined,
  SettingOutlined,
  ExportOutlined,
  GithubOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { Footer } from 'antd/lib/layout/layout'

type NavigationProps = {
  children: ReactNode
}

const { Content, Sider } = Layout

export const navItems = [
  {
    path: '/',
    text: 'Dashboard',
    icon: <DashboardOutlined />,
  },
  {
    path: '/exporter',
    text: 'Export',
    icon: <ExportOutlined />,
  },
  {
    path: '/settings',
    text: 'Settings',
    icon: <SettingOutlined />,
  },
]

export const Navigation = ({ children }: NavigationProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  const getSelectedItems = (): string[] => {
    return [
      navItems.find((item) => location.pathname === item.path)?.path || '/',
    ]
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div
          style={{
            display: 'flex',
            flexFlow: 'row nowrap',
            alignItems: 'center',
            padding: '24px 16px',
          }}
        >
          <Logo onClick={() => navigate('/', { replace: false })} />
          <Typography.Title level={5} style={{ color: '#fff', lineHeight: 1 }}>
            wh2o
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          selectedKeys={getSelectedItems()}
          onSelect={({ key }) => navigate(key, { replace: false })}
        >
          {navItems.map((item) => (
            <Menu.Item key={item.path} icon={item.icon}>
              {item.text}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ margin: '24px 16px 0' }}>
          <div
            className="site-layout-background"
            style={{ padding: 24, minHeight: 360 }}
          >
            {children}
          </div>
        </Content>
        <Footer
          style={{ display: 'flex', justifyContent: 'center', fontSize: 24 }}
        >
          <a
            style={{ color: '#000' }}
            href="https://github.com/drewalth/wh2o-next"
            target={'_blank'}
            rel={'noreferrer'}
          >
            <GithubOutlined />
          </a>
        </Footer>
      </Layout>
    </Layout>
  )
}
