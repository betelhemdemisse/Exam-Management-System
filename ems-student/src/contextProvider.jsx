import { useState, createContext, useContext } from "react";

const stateContext = createContext({
  user: null,
  token: null,
  setUser: () => { },
  setToken: () => { },
  setRefreshToken: () => { }, 
});

export const ContextProvider = ({ children }) => {
  const [user, _setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, _setToken] = useState(localStorage.getItem("userToken"));
  const [refreshToken, _setRefreshToken] = useState(localStorage.getItem("refreshToken"));
  const setUser = (user) => {
    _setUser(user);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  };

  const setToken = (token) => {
    _setToken(token);
    if (token) {
      localStorage.setItem("userToken", token);
    } else {
      localStorage.removeItem("userToken");
    }
  };
  const setRefereshToken = (refreshToken) => {
    _setRefreshToken(refreshToken);
  }

  return (
    <stateContext.Provider value={{ user, token, setUser, setToken, setRefereshToken, refreshToken }}>
      {children}
    </stateContext.Provider>
  );
};

export const useStateContext = () => useContext(stateContext);

