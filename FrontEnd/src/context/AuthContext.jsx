import { createContext, useState, useEffect } from "react";
import api from "../api/axios";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading , setLoading ] = useState(true)
  const fetchUser = async () => {
    try {
      const res = await api.get("users/get-user");
      // axios gives the data in data var and you dont need jsonify
      setUser(res.data.data.user);
    } catch (error) {
      setUser(null);
      console.log("Error : ", error);
    } finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser , loading}}>
      {children}
    </AuthContext.Provider>
  );
};
