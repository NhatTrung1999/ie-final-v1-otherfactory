import { ToastContainer } from 'react-toastify';
import AppRoute from './routes/AppRoute';

const App = () => {
  return (
    <>
      <AppRoute />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default App;
