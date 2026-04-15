import React, { useState } from "react";
import { Alert, Button, Form, Input } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { login } from "../api/authApi";
import "../styles/login.css";

const SHELF_BOOKS = [
  "login-book login-book--red",
  "login-book login-book--blue",
  "login-book login-book--gold",
  "login-book login-book--purple",
  "login-book login-book--dark",
  "login-book login-book--green",
];

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
      const backendMsg =
        e?.response?.data?.message ||
        e?.response?.data ||
        "Usuario o contrasena incorrectos.";

      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-stage">
        <section className="login-art-panel" aria-hidden="true">
          <div className="login-art-glow login-art-glow--one" />
          <div className="login-art-glow login-art-glow--two" />
          <div className="login-room-window">
            <span className="login-room-window-sun" />
            <span className="login-room-window-hill login-room-window-hill--back" />
            <span className="login-room-window-hill login-room-window-hill--front" />
          </div>

          <div className="login-art-posters">
            <div className="login-poster login-poster--one" />
            <div className="login-poster login-poster--two" />
          </div>

          <div className="login-art-shelf login-art-shelf--top">
            <div className="login-art-books">
              {SHELF_BOOKS.map((className, index) => (
                <span key={`${className}-${index}`} className={className} />
              ))}
            </div>
          </div>

          <div className="login-art-shelf login-art-shelf--mid">
            <div className="login-console">
              <span className="login-console-slot" />
              <span className="login-console-led" />
            </div>
            <div className="login-cartridges">
              <span className="login-cartridge login-cartridge--one" />
              <span className="login-cartridge login-cartridge--two" />
              <span className="login-cartridge login-cartridge--three" />
            </div>
          </div>

          <div className="login-floor-rug" />

          <div className="login-desk">
            <div className="login-monitor">
              <div className="login-monitor-screen">
                <span className="login-pixel login-pixel--one" />
                <span className="login-pixel login-pixel--two" />
                <span className="login-pixel login-pixel--three" />
                <span className="login-pixel login-pixel--four" />
              </div>
              <div className="login-monitor-stand" />
            </div>

            <div className="login-controller">
              <span className="login-controller-grip login-controller-grip--left" />
              <span className="login-controller-grip login-controller-grip--right" />
              <span className="login-controller-pad" />
              <span className="login-controller-buttons" />
            </div>

            <div className="login-media-crate">
              <span className="login-media-case login-media-case--one" />
              <span className="login-media-case login-media-case--two" />
              <span className="login-media-case login-media-case--three" />
            </div>

            <div className="login-handheld">
              <span className="login-handheld-screen" />
              <span className="login-handheld-pad" />
              <span className="login-handheld-buttons" />
            </div>
          </div>

          <div className="login-art-caption">
            <span className="login-art-kicker">Coleccion viva</span>
            <h2>Tu cuarto de juegos convertido en archivo personal.</h2>
            <p>Catalogo, copias, progreso y spines con una identidad visual hecha para coleccionistas.</p>
          </div>
        </section>

        <section className="login-panel">
          <div className="login-panel-head">
            <span className="login-panel-kicker">Acceso</span>
            <h1>Entra en tu coleccion</h1>
            <p>Abre tu biblioteca y sigue gestionando juegos, copias y partidas desde donde lo dejaste.</p>
          </div>

          {error && (
            <Alert
              className="login-alert"
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
            className="login-form"
          >
            <Form.Item
              label="Usuario"
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
              label="Contrasena"
              name="password"
              rules={[{ required: true, message: "Introduce tu contrasena." }]}
            >
              <Input.Password
                size="large"
                placeholder="Tu contrasena"
                prefix={<LockOutlined />}
                onPressEnter={() => form.submit()}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              className="login-submit"
            >
              Entrar
            </Button>
          </Form>

          <div className="login-panel-notes">
            <span className="login-note-pill">Biblioteca visual</span>
            <span className="login-note-pill">Copias y estados</span>
            <span className="login-note-pill">Playthroughs</span>
          </div>

          <div className="login-panel-footer">
            <span>Proyecto personal de coleccion y seguimiento de videojuegos.</span>
            <span>Juan Luis Aguilera Rivero</span>
          </div>
        </section>
      </div>
    </div>
  );
}
