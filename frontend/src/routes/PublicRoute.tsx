import { Navigate } from 'react-router';
import { useAppSelector } from '../app/hooks';

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { accessToken } = useAppSelector((state) => state.auth);
  return accessToken ? <Navigate to={'/'} replace /> : children;
};

export default PublicRoute;
