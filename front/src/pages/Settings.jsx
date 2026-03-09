import React from "react";
import { Card, Divider, Typography } from "antd";

const { Text } = Typography;

export default function Settings() {
  return (
    <Card title="Ajustes">
      Aquí irá modo nocturno, preferencias, etc.

      <Divider />

      <div>
        <Text strong>Data sources</Text>
        <div style={{ marginTop: 6 }}>
          <Text type="secondary">Games metadata is powered by </Text>
          <a href="https://www.igdb.com/" target="_blank" rel="noreferrer">
            IGDB.com
          </a>
          <Text type="secondary">.</Text>
        </div>
      </div>
    </Card>
  );
}
