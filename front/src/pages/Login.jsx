import React, { useState } from "react";
import { login } from "../api/authApi";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Typography,
  Space,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Login({ onSuccess }) {
  const [form] = Form.useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values) => {
    setError("");
    setLoading(true);

    try {
      const res = await login(values.username, values.password);

      if (!res?.status) {
        setError(res?.message || "Login fallido.");
        return;
      }

      onSuccess?.();
    } catch (e) {
      // dependiendo de cómo venga tu backend, esto puede variar
      const backendMsg =
        e?.response?.data?.message ||
        e?.response?.data ||
        "Usuario o contraseña incorrectos.";

      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 20% 10%, rgba(24,144,255,0.25), transparent 45%), radial-gradient(circle at 80% 30%, rgba(114,46,209,0.25), transparent 45%), linear-gradient(180deg, #0b1220 0%, #070a12 100%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        <Card
          bordered={false}
          style={{
            borderRadius: 18,
            background: "rgba(255,255,255,0.06)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            backdropFilter: "blur(10px)",
          }}
          styles={{
            body: { padding: 26 },
          }}
        >
          <Space direction="vertical" size={6} style={{ width: "100%" }}>
            <Title
              level={3}
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.92)",
                letterSpacing: 0.2,
              }}
            >
              Video Game Collection
            </Title>

            <Text style={{ color: "rgba(255,255,255,0.65)" }}>
              Accede para gestionar tu colección y registrar tus partidas.
            </Text>

            <div style={{ height: 10 }} />

            {error && (
              <Alert
                style={{ marginBottom: 8 }}
                type="error"
                showIcon
                message={error}
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              requiredMark={false}
              autoComplete="off"
            >
              <Form.Item
                label={<span style={{ color: "rgba(255,255,255,0.75)" }}>Usuario</span>}
                name="username"
                rules={[{ required: true, message: "Introduce tu usuario." }]}
              >
                <Input
                  size="large"
                  placeholder="Tu usuario"
                  prefix={<UserOutlined />}
                  onPressEnter={() => form.submit()}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "rgba(255,255,255,0.75)" }}>Contraseña</span>}
                name="password"
                rules={[{ required: true, message: "Introduce tu contraseña." }]}
              >
                <Input.Password
                  size="large"
                  placeholder="Tu contraseña"
                  prefix={<LockOutlined />}
                  // ✅ aquí está lo que querías:
                  onPressEnter={() => form.submit()}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  borderRadius: 12,
                  height: 44,
                  fontWeight: 600,
                }}
              >
                Entrar
              </Button>
            </Form>

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
                Miau
              </Text>
            </div>
          </Space>
        </Card>

        <div style={{ marginTop: 14, textAlign: "center" }}>
          <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
            Hecho por Juan Luis Aguilera Rivero ©
          </Text>
        </div>
      </div>
    </div>
  );
}
