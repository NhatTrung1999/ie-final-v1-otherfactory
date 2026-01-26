import { useFormik } from 'formik';
import { IoClose } from 'react-icons/io5';
import { AREA, STAGE } from '../types/constant';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  duplicateStage,
  fetchDuplicateList,
  resetDuplicateState,
} from '../features/duplicate/duplicateSlice';
import { formatDate } from '../utils/formatDate';
import { useState } from 'react';
import { stagelistList } from '../features/stagelist/stagelistSlice';
import { getData } from '../features/tablect/tablectSlice';
import { historyplaybackList } from '../features/historyplayback/historyplaybackSlice';

type Props = {
  setIsDuplicateOpen: (isOpen: boolean) => void;
};

const ModalDuplicate = ({ setIsDuplicateOpen }: Props) => {
  const { duplicate } = useAppSelector((state) => state.duplicate);
  const { filter } = useAppSelector((state) => state.stagelist);
  const dispatch = useAppDispatch();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const formik = useFormik({
    initialValues: {
      DateFrom: '',
      DateTo: '',
      Season: '',
      Stage: '',
      Area: '',
      Article: '',
    },
    onSubmit: async (data) => {
      await dispatch(fetchDuplicateList({ ...data }));
    },
  });

  const handleCheckboxChange = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDuplicate = async () => {
    await dispatch(duplicateStage(selectedIds));
    await dispatch(stagelistList({ ...filter }));
    await dispatch(getData({ ...filter }));
    await dispatch(historyplaybackList());
    setIsDuplicateOpen(false);
  };

  return (
    <div className="fixed bg-transparent inset-0 flex justify-center items-center z-60">
      <div className="w-full max-w-2xl bg-white flex rounded-md shadow-lg flex-col p-2">
        <div className="border-b border-gray-200 p-3 flex items-center justify-between text-gray-600">
          <h1 className="text-2xl font-bold">Duplicate Stage</h1>
          <div
            className="p-1 cursor-pointer"
            onClick={() => {
              setIsDuplicateOpen(false);
              dispatch(resetDuplicateState());
            }}
          >
            <IoClose size={24} />
          </div>
        </div>
        <form className="space-y-4 p-2" onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-4 gap-2">
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
                value={formik.values.Season}
                onChange={formik.handleChange}
                autoComplete="off"
                className="w-full px-2 py-1.5 capitalize border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
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
                <option value="">Choose option</option>
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
                className="w-full px-2 py-1.5 capitalize border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
                placeholder="Enter your article..."
              />
            </div>
            <div>
              <label
                htmlFor="Article"
                className="block mb-1 text-base font-medium text-gray-700 invisible"
              >
                Article
              </label>
              <button
                type="submit"
                className="w-full px-2 py-1.5 cursor-pointer font-medium hover:cursor-pointer text-white bg-gray-500 rounded-lg hover:bg-gray-600 "
              >
                Search
              </button>
            </div>
          </div>
          <div className="max-h-[200px] border rounded-lg border-gray-300 overflow-y-auto p-2 flex flex-col gap-2">
            {duplicate.length === 0 ? (
              <div className="text-center font-medium">No Data</div>
            ) : (
              duplicate.map((item, i) => (
                <label
                  key={i}
                  className="flex items-center border border-gray-300 px-2 py-1.5 rounded-lg gap-2"
                  htmlFor={`duplicate-${item.Id}`}
                >
                  <input
                    id={`duplicate-${item.Id}`}
                    type="checkbox"
                    checked={selectedIds.includes(item.Id)}
                    onChange={() => handleCheckboxChange(item.Id)}
                    className="accent-gray-500 border border-gray-300 size-3.5"
                  />{' '}
                  <span
                    className="truncate"
                    title={`${item.Season}-${item.Stage}-${item.Area}-${
                      item.Article
                    }-${formatDate(item.Date)} (${item.Name})`}
                  >{`${item.Season}-${item.Stage}-${item.Area}-${
                    item.Article
                  }-${formatDate(item.Date)} (${item.Name})`}</span>
                </label>
              ))
            )}
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-2">
            <button
              type="button"
              onClick={handleDuplicate}
              className={`px-2.5 py-1.5 cursor-pointer font-medium text-white bg-green-500 rounded-lg hover:bg-green-500 focus:ring-2 focus:ring-green-400`}
            >
              Duplicate
            </button>
            <button
              type="button"
              onClick={() => {
                setIsDuplicateOpen(false);
                dispatch(resetDuplicateState());
              }}
              className="px-2.5 py-1.5 cursor-pointer font-medium hover:cursor-pointer text-white bg-red-600 rounded-lg hover:bg-red-500 focus:ring-2 focus:ring-blue-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalDuplicate;
