import React, { useState } from "react";
import "./style.css";
import 'bootstrap/dist/css/bootstrap.css';
import { useNavigate } from "react-router-dom";
import { login } from "../Services/authApi.js";

// Traceability:
// UC-02 User logs in.

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Traceability: UC-02 validates credentials and starts the authenticated session.
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!email || !password) {
      setErrorMsg("Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password);
      if (result.user) {
        alert("Login successful!");
        navigate("/folders");
      }
    } catch (error) {
      // Show backend error if present, otherwise show a user-friendly message
      if (error.message === "Failed to fetch") {
        setErrorMsg("Cannot connect to server. Please try again later.");
      } else if (error.message === "Invalid email or password") {
        setErrorMsg("Incorrect email or password.");
      } else {
        setErrorMsg(error.message || "Login failed. Please try again.");
      }
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Note Taking App</h1>
        <p className="login-sub">Note Taking Node Graph System</p>

        {errorMsg && <div className="alert alert-danger mb-3">{errorMsg}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group" id="form1">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              className="form-input"
              type="email"
              id="email"
              placeholder="note@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group" id="form2">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="password-wrap">
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="password-toggle"
                type="button"
                id="pwd-toggle"
                aria-label="Toggle password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary btn-full"
            id="login-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <a href="#" className="forgot-link">Forgot password?</a>
        <a href="/register" className="forgot-link">Register</a>

        <hr className="login-divider" />
      </div>
    </div>
  );
};

export default Login;