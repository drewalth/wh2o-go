import React, { useState } from "react";
import { Layout, Menu, Typography } from "antd";
import { AreaChartOutlined, NotificationOutlined } from "@ant-design/icons";
import { Gage } from "../Gage/Gage";
import { Alert } from "../Alert/Alert";
import Logo from "../common/wh2o-logo";

const { Content, Sider, Footer } = Layout;

type Tabs = "1" | "2";

function App() {
  const [activeTab, setActiveTab] = useState<Tabs>("1");

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div
          style={{
            display: "flex",
            flexFlow: "row nowrap",
            alignItems: "center",
            padding: "24px 16px",
          }}
        >
          <Logo />
          <Typography.Title level={5} style={{ color: "#fff", lineHeight: 1 }}>
            wh2o
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          onSelect={({ key }) => setActiveTab(key as Tabs)}
        >
          <Menu.Item key="1" icon={<AreaChartOutlined />}>
            Gages
          </Menu.Item>
          <Menu.Item key="2" icon={<NotificationOutlined />}>
            Alerts
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ margin: "24px 16px 0" }}>
          <div
            className="site-layout-background"
            style={{ padding: 24, minHeight: 360 }}
          >
            {activeTab === "1" && <Gage />}
            {activeTab === "2" && <Alert />}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
export default App;
