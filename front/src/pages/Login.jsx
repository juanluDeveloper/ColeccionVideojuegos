import React, { useState } from "react";
import { login } from "../api/authApi";
import { Alert, Button, Input } from "antd";

export default function Login({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      const res = await login(username, password);
      if (!res?.status) {
        setError(res?.message || "Login fallido.");
        return;
      }
      onSuccess?.();
    } catch (e) {
      setError(e?.response?.data || "Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto" }}>
      <h2>Iniciar sesión</h2>
      {error && <Alert style={{ marginBottom: 12 }} type="error" message={error} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
        <Input.Password placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="primary" onClick={handleLogin}>Entrar</Button>
      </div>
    </div>
  );
}