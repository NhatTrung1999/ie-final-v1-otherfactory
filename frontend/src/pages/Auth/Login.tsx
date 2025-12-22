import loginImage from '../../assets/login.svg';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import type { ILoginPayload } from '../../types/auth';
import { useAppDispatch } from '../../app/hooks';
import { login } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

const initialValues: ILoginPayload = {
  username: '',
  password: '',
  factory: '',
  category: '',
};

const validationSchema = Yup.object({
  username: Yup.string().required('Please do not it blank!'),
  password: Yup.string().required('Please do not it blank!'),
  factory: Yup.string().required('Please do not it blank!'),
  category: Yup.string().required('Please do not it blank!'),
});

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (data) => {
      const { username, password, factory, category } = data;
      const result = await dispatch(
        login({
          username: username.trim(),
          password: password.trim(),
          factory: factory.trim(),
        })
      );
      if (login.fulfilled.match(result)) {
        localStorage.setItem('category', category as string);
        navigate('/');
      } else {
        toast.error(result.payload as string);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-500 flex justify-center items-center">
      <div className="w-full max-w-3xl bg-white flex rounded-lg shadow-lg">
        <div className="flex-1 p-2">
          <img
            src={loginImage}
            className="size-96 bg-gray-200 p-2 rounded-lg shadow-2xs h-full"
          />
        </div>
        <div className="flex-1 p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-sm text-gray-500">
              Please login to your account
            </p>
          </div>
          <form className="space-y-4" onSubmit={formik.handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                autoComplete="off"
                className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
              />
              {formik.touched.username && formik.errors.username ? (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.username}
                </div>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="off"
                value={formik.values.password}
                onChange={formik.handleChange}
                className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
              />
              {formik.touched.password && formik.errors.password ? (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.password}
                </div>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="factory"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Factory
              </label>
              <select
                id="factory"
                name="factory"
                value={formik.values.factory}
                onChange={formik.handleChange}
                className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
              >
                <option value="">Choose option</option>
                <option value="LYV">LYV</option>
                <option value="LHG">LHG</option>
                <option value="LVL">LVL</option>
                <option value="LYM">LYM</option>
              </select>
              {formik.touched.factory && formik.errors.factory ? (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.factory}
                </div>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="category"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
              >
                <option value="">Choose option</option>
                <option value="FF28">FF28</option>
                <option value="COSTING">COSTING</option>
                <option value="LSA">LSA</option>
              </select>
              {formik.touched.category && formik.errors.category ? (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.category}
                </div>
              ) : null}
            </div>
            <button
              type="submit"
              className="w-full px-2 py-2 cursor-pointer font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
