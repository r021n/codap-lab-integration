import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useRedirectIfAuthenticated(redirectTo = "/dashboard") {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo]);
}
