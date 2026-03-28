import axios from "axios";
import api from "./api";

const API_URL = import.meta.env.VITE_API_URL || "https://glassesweb.onrender.com";

export const login = async (username, password) => {
  const res = await axios.post(`${API_URL}/auth/login`, {
    username,
    password,
  });
  const token = res.data.token;
  if (!token) throw new Error("No token");
  localStorage.setItem("token", token);

  // Lấy profile sau khi login
  const profileRes = await api.get("/customer/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  localStorage.setItem("user", JSON.stringify(profileRes.data));
  return profileRes.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const register = async (data) => {
  const res = await axios.post(`${API_URL}/auth/register`, data);
  return res.data;
};

export const getToken = () => localStorage.getItem("token");
export const getUser = () => {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
};