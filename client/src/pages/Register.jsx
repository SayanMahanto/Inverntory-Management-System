import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setSuccess("User registered successfully!");
      setFormData({ name: "", email: "", password: "", role: "staff" });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  if (user.role !== "admin") {
    navigate("/dashboard");
  }
  if (!user) {
    navigate("/login");
  }

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto" }} className="p-4">
      <h2 className="text-center text-3xl font-bold mb-8 text-white">
        Register New User
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center space-y-6"
      >
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded focus:outline-none focus:shadow-outline mt-4"
        >
          Register
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">{success}</p>}
      </form>
      <button
        onClick={handleGoBack}
        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded focus:outline-none focus:shadow-outline mt-4"
      >
        Go Back
      </button>
    </div>
  );
};

export default Register;
