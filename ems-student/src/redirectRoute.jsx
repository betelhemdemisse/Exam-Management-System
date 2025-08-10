import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from './contextProvider';

const RedirectRoute = () => {
  const navigate = useNavigate();

  useEffect(() => {
     const { token } = useStateContext();

    if (token) {
      navigate('/exam', { replace: true });
    } else {
      navigate('/sign-in'); 
    }
  }, [navigate]);

  return null;
};

export default RedirectRoute;
