import { IoClose } from 'react-icons/io5';
import { AREA, STAGE } from '../types/constant';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import type { IFormModal } from '../types/modal';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  setFormUploadVideo,
  stagelistList,
  stagelistUpload,
} from '../features/stagelist/stagelistSlice';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type Props = {
  setIsOpen: (isOpen: boolean) => void;
};

const initialValues: IFormModal = {
  date: new Date().toISOString().slice(0, 10),
  season: '',
  stage: '',
  cutDie: '',
  area: 'CUTTING',
  article: '',
  files: [],
};

const validationSchema = Yup.object({
  date: Yup.string().required('Please do not it blank!'),
  season: Yup.string().required('Please do not it blank!'),
  stage: Yup.string().required('Please do not it blank!'),
  cutDie: Yup.string().required('Please do not it blank!'),
  area: Yup.string().required('Please do not it blank!'),
  article: Yup.string().required('Please do not it blank!'),
  files: Yup.array()
    .min(1, 'Please choose at least 1 video!')
    .max(5, 'Upload a maximum of 5 videos!'),
});

const Modal = ({ setIsOpen }: Props) => {
  const [progress, setProgress] = useState<number>(0);
  const [controller, setController] = useState<AbortController | null>(null);
  const { formUploadVideo, filter } = useAppSelector(
    (state) => state.stagelist
  );
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (data) => {
      const abortController = new AbortController();
      setController(abortController);
      dispatch(
        setFormUploadVideo({
          date: data.date,
          season: data.season,
          stage: data.stage,
          cutDie: data.cutDie,
          area: data.area,
          article: data.article,
        })
      );

      const result = await dispatch(
        stagelistUpload({
          payload: data,
          onProgress: (p) => setProgress(p),
          controller: abortController,
        })
      );
      if (stagelistUpload.fulfilled.match(result)) {
        toast.success('Upload video success!');
      } else {
        toast.error(result.payload as string);
      }
      dispatch(stagelistList({ ...filter }));
      setIsOpen(false);
      setProgress(0);
    },
  });

  // const handleClose = () => {
  //   setIsOpen(false);
  //   setProgress(0);
  //   setController(null);
  // };

  const handleCancelUpload = () => {
    if (controller) {
      controller.abort();
      setProgress(0);
      setController(null);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (formUploadVideo) {
      formik.setValues({
        ...formik.values,
        date: formUploadVideo.date || new Date().toISOString().slice(0, 10),
        season: formUploadVideo.season || '',
        stage: formUploadVideo.stage || '',
        cutDie: formUploadVideo.cutDie || '',
        area: formUploadVideo.area || 'CUTTING',
        article: formUploadVideo.article || '',
      });
    }
  }, [formUploadVideo]);

  return (
    <div className="fixed bg-transparent inset-0 flex justify-center items-center z-50">
      <div className="w-full max-w-sm bg-white flex rounded-md shadow-lg flex-col p-2">
        <div className="border-b border-gray-200 p-3 flex items-center justify-between text-gray-600">
          <h1 className="text-2xl font-bold">Upload Video</h1>
          <div className="p-1 cursor-pointer" onClick={handleCancelUpload}>
            <IoClose size={24} />
          </div>
        </div>
        <form className="space-y-2 p-2" onSubmit={formik.handleSubmit}>
          <div>
            <label
              htmlFor="date"
              className="block mb-1 text-base font-medium text-gray-700"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formik.values.date}
              onChange={formik.handleChange}
              className="w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
            />
            {formik.touched.date && formik.errors.date ? (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.date}
              </div>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="season"
              className="block mb-1 text-base font-medium text-gray-700"
            >
              Season
            </label>
            <input
              type="text"
              id="season"
              name="season"
              autoComplete="off"
              value={formik.values.season}
              onChange={formik.handleChange}
              className="w-full px-2 py-1.5 uppercase border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
              placeholder="Enter your season..."
            />
            {formik.touched.season && formik.errors.season ? (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.season}
              </div>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="stage"
              className="block mb-1 text-base font-medium text-gray-700"
            >
              Stage
            </label>
            <select
              id="stage"
              name="stage"
              value={formik.values.stage}
              onChange={formik.handleChange}
              className="w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
            >
              {STAGE.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {formik.touched.stage && formik.errors.stage ? (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.stage}
              </div>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="cutDie"
              className="block mb-1 text-base font-medium text-gray-700"
            >
              Cut Die
            </label>
            <input
              type="text"
              id="cutDie"
              name="cutDie"
              autoComplete="off"
              value={formik.values.cutDie}
              onChange={formik.handleChange}
              className="w-full px-2 py-1.5 uppercase border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
              placeholder="Enter your cutDie..."
            />
            {formik.touched.cutDie && formik.errors.cutDie ? (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.cutDie}
              </div>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="area"
              className="block mb-1 text-base font-medium text-gray-700"
            >
              Area
            </label>
            <select
              id="area"
              name="area"
              value={formik.values.area}
              onChange={formik.handleChange}
              className="w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
            >
              {AREA.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {formik.touched.area && formik.errors.area ? (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.area}
              </div>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="article"
              className="block mb-1 text-base font-medium text-gray-700"
            >
              Article
            </label>
            <input
              type="text"
              id="article"
              name="article"
              autoComplete="off"
              value={formik.values.article}
              onChange={formik.handleChange}
              className="w-full px-2 py-1.5 uppercase border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
              placeholder="Enter your article..."
            />
            {formik.touched.article && formik.errors.article ? (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.article}
              </div>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="file"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Video
            </label>
            <input
              type="file"
              id="file"
              name="file"
              multiple
              accept="video/*"
              onChange={(e) => {
                formik.setFieldValue(
                  'files',
                  Array.from(e.currentTarget.files ?? [])
                );
              }}
              className="w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
            />
            {formik.touched.files && formik.errors.files ? (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.files as string}
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={progress > 0 ? true : false}
              className={`w-full px-2 py-2 cursor-pointer font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-400 ${
                progress > 0
                  ? 'hover:cursor-not-allowed'
                  : 'hover:cursor-pointer'
              }`}
            >
              {progress > 0 ? `Uploading...${progress}%` : 'Upload'}
            </button>
            <button
              type="button"
              onClick={handleCancelUpload}
              className="w-full px-2 py-2 cursor-pointer font-medium hover:cursor-pointer text-white bg-red-600 rounded-lg hover:bg-red-500 focus:ring-2 focus:ring-blue-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
