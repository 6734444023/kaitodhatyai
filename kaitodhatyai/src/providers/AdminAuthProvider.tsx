import { createContext, useContext, useState } from "react";
import adminLogin from "../services/admin";

interface IAdminAuthContext {
  isAuth: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<IAdminAuthContext>({
  isAuth: false,
  login: async () => {},
  logout: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isAuth, setIsAuth] = useState(false);

  const login = async (password: string) => {
    const res = await adminLogin(password);
    if (res.success) setIsAuth(true);
    else alert("รหัสผ่านไม่ถูกต้อง");
  };

  const logout = () => {
    setIsAuth(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuth, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
