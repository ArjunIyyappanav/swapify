import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkAuth } from "../utils/checkAuth";

export default function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState({ loading: true, user: null });

  useEffect(() => {
    const verify = async () => {
      const user = await checkAuth();
      setAuth({ loading: false, user });
    };
    verify();
  }, []);

  if (auth.loading) return null;
  if (!auth.user) return <Navigate to="/login" replace />;

  return children;
}
