import { useAppSelector } from '../app/hooks';
import Home from '../pages/Main/Home';
import { Navigate } from 'react-router';

const ProtectedRoute = () => {
  const { accessToken } = useAppSelector((state) => state.auth);
  return accessToken ? <Home /> : <Navigate to={'/login'} replace />;
};

export default ProtectedRoute;
