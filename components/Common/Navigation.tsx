import React, { ReactNode } from 'react';
import Logo from './wh2o-logo';
import { Layout, Menu, Typography } from 'antd';
import 'antd/dist/antd.css';
import { DashboardOutlined, SettingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

type NavigationProps = {
  children: ReactNode;
};

const { Content, Sider } = Layout;

const navItems = [
  {
    path: '/',
    text: 'Dashboard',
    icon: <DashboardOutlined />,
  },
  // {
  //   path: '/export',
  //   text: 'Export',
  //   icon:  <ExportOutlined />,
  // },
  {
    path: '/settings',
    text: 'Settings',
    icon: <SettingOutlined />,
  },
  // {
  //   path: '/climb',
  //   text: 'Climb',
  //   icon: <StockOutlined />,
  // },
  // {
  //   path: '/snow',
  //   text: 'Ski',
  //   icon: <RadarChartOutlined />,
  // },
];

export const Navigation = ({ children }: NavigationProps) => {
  const router = useRouter();

  const getSelectedItems = (): string[] => {
    return [
      navItems.find((item) => router.pathname === item.path)?.path || '/',
    ];
  };

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
          <Logo onClick={() => router.push('/')} />
          <Typography.Title level={5} style={{ color: '#fff', lineHeight: 1 }}>
            wh2o
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          selectedKeys={getSelectedItems()}
          onSelect={({ key }) => router.push(key)}
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
      </Layout>
    </Layout>
  );
};
