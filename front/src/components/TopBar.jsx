import React from "react";
import { Breadcrumb, Dropdown, Avatar, Space } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../api/authApi";

function getBreadcrumb(pathname) {
  // Mapa simple; luego lo refinamos
  if (pathname.includes("/app/home")) return ["Home"];
  if (pathname.includes("/app/library")) return ["Mi librería"];
  if (pathname.includes("/app/settings")) return ["Ajustes"];
  if (pathname.includes("/app/profile")) return ["Perfil"];
  return ["App"];
}

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const username = localStorage.getItem("auth_username") || "Usuario";

  const items = [
    {
      key: "profile",
      label: "Ver perfil",
      onClick: () => navigate("/app/profile"),
    },
    {
      key: "logout",
      label: "Cerrar sesión",
      onClick: () => {
        logout();
        navigate("/login");
      },
    },
  ];

  const crumbs = getBreadcrumb(location.pathname);

  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      <Breadcrumb
        items={crumbs.map((c) => ({ title: c }))}
        style={{ flex: 1 }}
      />

      <Dropdown menu={{ items }} trigger={["click"]}>
        <Space style={{ cursor: "pointer" }}>
          <Avatar>
            {username?.[0]?.toUpperCase() || "U"}
          </Avatar>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 600 }}>{username}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Cuenta</div>
          </div>
        </Space>
      </Dropdown>
    </div>
  );
}