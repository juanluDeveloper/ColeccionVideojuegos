import React from "react";
import { Card, Row, Col } from "antd";

export default function Home() {
  return (
    <div>
      <Row gutter={16}>
        <Col span={6}><Card title="Total juegos">0</Card></Col>
        <Col span={6}><Card title="Completados">0</Card></Col>
        <Col span={6}><Card title="Horas jugadas">0</Card></Col>
        <Col span={6}><Card title="Backlog">0</Card></Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <Card title="Resumen">
          Aquí pondremos widgets (por plataforma, progreso, últimos añadidos, etc.).
        </Card>
      </div>
    </div>
  );
}