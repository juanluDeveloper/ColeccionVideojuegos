import React from "react";
import { Card, Descriptions } from "antd";

export default function Profile() {
  const username = localStorage.getItem("auth_username") || "Usuario";

  return (
    <Card title="Perfil">
      <Descriptions column={1}>
        <Descriptions.Item label="Username">{username}</Descriptions.Item>
        <Descriptions.Item label="Rol">Pendiente (cuando expongamos roles)</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}