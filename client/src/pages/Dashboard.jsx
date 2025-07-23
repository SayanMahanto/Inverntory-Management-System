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
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-bold mb-4">Welcome, {user?.name} 👋</h2>
        <p className="text-lg text-gray-300 mb-6">Role: {user?.role}</p>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>

        {admin && (
          <div className="mt-6 space-y-4">
            {" "}
            <button
              onClick={handleAdmin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded focus:outline-none focus:shadow-outline"
            >
              Admin Dashboard
            </button>
            <button
              onClick={handleRegister}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded focus:outline-none focus:shadow-outline"
            >
              Register New User
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
