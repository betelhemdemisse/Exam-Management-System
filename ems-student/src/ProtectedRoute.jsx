import { useEffect, useState } from "react";
import { Navigate } from 'react-router-dom';
import { useStateContext } from './contextProvider';
const ProtectedRoute = ({ children }) => {
  const { token } = useStateContext();
  const [loading, setLoading] = useState(true);
  if (!token) {
    return <Navigate to="/sign-in" />;
  }



  return children;
};

export default ProtectedRoute;
