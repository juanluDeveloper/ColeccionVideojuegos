import React from "react";
import { Layout } from "antd";
import SideNav from "../components/SideNav";
import TopBar from "../components/TopBar";
import "../styles/layout.css";

const { Sider, Header, Content } = Layout;

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        theme="light"
        className="app-sider"
      >
        <div className="app-logo">
          {collapsed ? "VG" : "VideoGames"}
        </div>

        <SideNav collapsed={collapsed} />
      </Sider>

      <Layout>
        <Header className="app-header">
          <TopBar />
        </Header>

        <Content className="app-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
