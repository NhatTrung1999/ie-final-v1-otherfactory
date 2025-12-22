import { useState } from 'react';
import { FaCircleUser } from 'react-icons/fa6';
import { TbLogout, TbFilterCog } from 'react-icons/tb';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { IoClose } from 'react-icons/io5';
import { AREA, STAGE } from '../types/constant';
import { useFormik } from 'formik';
import {
  setActiveItemId,
  setFilter,
  stagelistList,
} from '../features/stagelist/stagelistSlice';
import { getData, setActiveColId } from '../features/tablect/tablectSlice';

const Header = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const { filter } = useAppSelector((state) => state.stagelist);
  const { auth } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: {
      DateFrom: filter?.DateFrom,
      DateTo: filter?.DateTo,
      Season: filter?.Season,
      Stage: filter?.Stage,
      Area: filter?.Area,
      Article: filter?.Article,
    },
    onSubmit: async (data) => {
      dispatch(setFilter({ ...data }));
      dispatch(stagelistList({ ...data }));
      dispatch(getData({ ...data }));
      setIsFilterOpen(false);
      dispatch(setActiveItemId(null));
      dispatch(setActiveColId(null));
    },
  });

  const handleOpen = () => {
    setOpen(!open);
  };
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <header className="h-[70px] bg-gray-600 sticky top-0 flex items-center justify-between px-3 z-60">
        <div className="text-xl text-white font-bold">IE Video CT System</div>
        <div className="flex items-center gap-2">
          <div
            className="p-2 bg-gray-300/40 rounded-full text-white cursor-pointer"
            onClick={toggleFilter}
          >
            <TbFilterCog size={22} />
          </div>
          <div className="flex items-center gap-2 bg-gray-500 px-3 py-2 rounded-full text-white relative cursor-pointer">
            <div className="font-semibold" onClick={handleOpen}>
              {auth?.Name}
            </div>
            <FaCircleUser size={26} />
            {open && (
              <div className="absolute top-12 bg-white right-0 p-2 text-black rounded-md w-[150px]">
                <div
                  onClick={handleLogout}
                  className="flex items-center justify-between font-medium hover:bg-gray-300 px-2 py-1 cursor-pointer"
                >
                  <span className="text-base">Logout</span>{' '}
                  <TbLogout size={20} />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      {isFilterOpen && (
        <div className="fixed inset-y-0 right-0 bg-white z-[999] w-xs p-2 space-y-4 shadow-2xl animate-slide-in">
          <h1 className="text-center text-2xl font-semibold text-gray-600 relative">
            <div
              className="p-1 cursor-pointer absolute left-2 top-1 hover:text-red-500 transition"
              onClick={toggleFilter}
            >
              <IoClose size={24} />
            </div>
            Filter
          </h1>
          <form className="space-y-2" onSubmit={formik.handleSubmit}>
            <div>
              <label
                htmlFor="DateFrom"
                className="block mb-1 text-base font-medium text-gray-700"
              >
                Date From
              </label>
              <input
                type="date"
                id="DateFrom"
                name="DateFrom"
                value={formik.values.DateFrom}
                onChange={formik.handleChange}
                className="w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
              />
            </div>
            <div>
              <label
                htmlFor="DateTo"
                className="block mb-1 text-base font-medium text-gray-700"
              >
                Date To
              </label>
              <input
                type="date"
                id="DateTo"
                name="DateTo"
                value={formik.values.DateTo}
                onChange={formik.handleChange}
                className="w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
              />
            </div>
            <div>
              <label
                htmlFor="Season"
                className="block mb-1 text-base font-medium text-gray-700"
              >
                Season
              </label>
              <input
                type="text"
                id="Season"
                name="Season"
                autoComplete="off"
                value={formik.values.Season}
                onChange={formik.handleChange}
                className="w-full px-2 py-1.5 uppercase border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
                placeholder="Enter your season..."
              />
            </div>
            <div>
              <label
                htmlFor="Stage"
                className="block mb-1 text-base font-medium text-gray-700"
              >
                Stage
              </label>
              <select
                id="Stage"
                name="Stage"
                value={formik.values.Stage}
                onChange={formik.handleChange}
                className="w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
              >
                {STAGE.map((item, index) => (
                  <option key={index} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="Area"
                className="block mb-1 text-base font-medium text-gray-700"
              >
                Area
              </label>
              <select
                id="Area"
                name="Area"
                value={formik.values.Area}
                onChange={formik.handleChange}
                className="w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
              >
                <option value="">Choose option</option>

                {AREA.map((item, index) => (
                  <option key={index} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="Article"
                className="block mb-1 text-base font-medium text-gray-700"
              >
                Article
              </label>
              <input
                type="text"
                id="Article"
                name="Article"
                autoComplete="off"
                value={formik.values.Article}
                onChange={formik.handleChange}
                className="w-full px-2 py-1.5 uppercase border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
                placeholder="Enter your article..."
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full px-2 py-2 cursor-pointer font-medium hover:cursor-pointer text-white bg-gray-500 rounded-lg hover:bg-gray-600 "
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Header;
