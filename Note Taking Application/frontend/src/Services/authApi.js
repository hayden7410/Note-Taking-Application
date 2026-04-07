const API_URL = "http://localhost:8800/api/auth";

export const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const getAuthHeaders = (includeJson = false) => {
  const token = getAuthToken();
  const headers = {};

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Login user
export const login = async (email, password) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    // Store user info and token in localStorage for persistence
    if (data.user && data.token) {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Register user
export const register = async (email, password) => {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Registration failed");
    }

    return data;
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
};

// Logout user (clear local storage)
export const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

