import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import "../css/login.css";
import img from "../STC_logo-01.png";

const API_URL = process.env.REACT_APP_API_URL;

const UpdateUserPassword = () => {
  const { userId } = useParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const history = useNavigate();

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await localforage.getItem("token");
        const response = await api.get(`${API_URL}/auth/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEmail(response.data.email || "");
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch user");
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`${API_URL}/auth/update-usersss/${userId}`, {
        email,
        password,
      });
      alert("Password updated successfully!");
      history("/userdashboard");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container">
      <div className="login">
        <img src={img} className="img" alt="STC Logo" />
        <form onSubmit={handleSubmit}>
          <div>
            <input
              style={{ width: "100%" }}
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              style={{ width: "100%" }}
              type={showPassword ? "text" : "password"}
              placeholder="Enter New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              style={{ marginTop: "5px", fontSize: "12px" }}
            >
              {showPassword ? "Hide" : "Show"} Password
            </button>
          </div>
          <button type="submit">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default UpdateUserPassword;
