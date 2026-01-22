import { useEffect, useState } from "react";
import { setUser, logout } from "../utils/auth";
import useNotification from "../plugin/useNotification";

import HSChat from "../views/partials/HSChat";

const MainWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);
  useNotification();

  useEffect(() => {
    const handler = async () => {
      setLoading(true);
      try {
        await setUser();
      } catch (error) {
        console.error("Critical error in MainWrapper/setUser:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    handler();
  }, []);

  return (
    <>
      {loading ? null : children}
      <HSChat />
    </>
  );
};

export default MainWrapper;
