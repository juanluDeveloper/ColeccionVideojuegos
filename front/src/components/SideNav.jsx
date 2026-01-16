import React from "react";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineHome, AiOutlineAppstore, AiOutlineSetting, AiOutlineUser } from "react-icons/ai";

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { key: "/app/home", icon: <AiOutlineHome />, label: "Home" },
    { key: "/app/library", icon: <AiOutlineAppstore />, label: "Mi librería" },
    { key: "/app/settings", icon: <AiOutlineSetting />, label: "Ajustes" },
    { key: "/app/profile", icon: <AiOutlineUser />, label: "Perfil" },
  ];

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={items}
      onClick={({ key }) => navigate(key)}
    />
  );
}