import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/auth", { replace: true });
  }, [navigate]);

  return null;
};

export default NotFound;
