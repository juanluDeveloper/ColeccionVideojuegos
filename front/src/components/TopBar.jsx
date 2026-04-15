import React from "react";
import { Avatar, Breadcrumb, Button, Space } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../api/authApi";

function getBreadcrumb(pathname) {
  if (pathname.includes("/app/home")) return ["Home"];
  if (pathname.includes("/app/library")) return ["Mi biblioteca"];
  if (pathname.includes("/app/settings")) return ["Ajustes"];
  if (pathname.includes("/app/profile")) return ["Perfil"];
  return ["App"];
}

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const accountRef = React.useRef(null);

  const username = localStorage.getItem("auth_username") || "Usuario";
  const crumbs = getBreadcrumb(location.pathname);

  React.useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!accountRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("touchstart", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("touchstart", handlePointerDown);
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const goToProfile = () => {
    setMenuOpen(false);
    navigate("/app/profile");
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <div className="topbar-shell">
      <Breadcrumb
        items={crumbs.map((crumb) => ({ title: crumb }))}
        style={{ flex: 1 }}
      />

      <div ref={accountRef} className={`topbar-account${menuOpen ? " is-open" : ""}`}>
        <Button
          type="text"
          className="topbar-account-trigger"
          onClick={toggleMenu}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <Space>
            <Avatar>{username?.[0]?.toUpperCase() || "U"}</Avatar>
            <div className="topbar-account-meta">
              <div>{username}</div>
              <div className="topbar-account-role">Cuenta</div>
            </div>
          </Space>
        </Button>

        {menuOpen && (
          <div className="topbar-account-menu" role="menu">
            <button type="button" className="topbar-account-menu-item" onClick={goToProfile}>
              Ver perfil
            </button>
            <button type="button" className="topbar-account-menu-item" onClick={handleLogout}>
              Cerrar sesion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
