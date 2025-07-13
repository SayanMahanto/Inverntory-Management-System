import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const admin = user.role === "admin" ? true : false;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAdmin = (e) => {
    e.preventDefault();
    navigate("/admin");
  };

  const handleRegister = (e) => {
    e.preventDefault();
    navigate("/register");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome, {user?.name} 👋</h2>
      <p>Role: {user?.role}</p>

      <button
        onClick={handleLogout}
        style={{
          padding: "10px 20px",
          background: "#e74c3c",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
      {admin && (
        <>
          <br />
          <br />
          <button
            onClick={handleAdmin}
            style={{
              padding: "10px 20px",
              background: "#533ce7ff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Admin Dashboard
          </button>
          <br />
          <br />
          <button
            onClick={handleRegister}
            style={{
              padding: "10px 20px",
              background: "#3ce76dff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Resgiter New User
          </button>
        </>
      )}
    </div>
  );
};

export default Dashboard;
