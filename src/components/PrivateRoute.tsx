import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { accessToken } = useAuth();
  const storedToken = localStorage.getItem("access_token");

  if (!accessToken && !storedToken) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
