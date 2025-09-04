import axios from "./api";

export const checkAuth = async () => {
  try {
    const res = await axios.get("/auth/checkAuth", { withCredentials: true });
    return res.data; // contains user info
  } catch (err) {
    console.log("Auth check failed", err);
    return null;
  }
};
