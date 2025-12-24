import { useEffect, useState } from "react";
import { setUser, logout } from "../utils/auth";

const MainWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = async () => {
      setLoading(true);
      try {
        await setUser();
      } catch (error) {
        console.error("Error in setUser:", error);
        logout();
      }
      setLoading(false);
    };

    handler();
  }, []);

  return <>{loading ? null : children}</>;
};

export default MainWrapper;
