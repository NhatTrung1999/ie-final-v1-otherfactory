import { IoClose } from 'react-icons/io5';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { setUpdateValueRow } from '../features/tablect/tablectSlice';
import { resetTypes } from '../features/controlpanel/controlpanelSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';

type Props = {
  setIsOpen: (isOpen: boolean) => void;
  activeColId?: string | null;
};

const initialValues: { pieces: string; layers: string } = {
  pieces: '',
  layers: '',
};

const validationSchema = Yup.object({
  pieces: Yup.string().required('Please do not it blank!'),
  layers: Yup.string().required('Please do not it blank!'),
});

const ModalLSA = ({ setIsOpen, activeColId }: Props) => {
  const { types } = useAppSelector((state) => state.controlpanel);
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (data) => {
      const { pieces, layers } = data;
      if (!activeColId) return;
      const [id, colId] = activeColId?.split('_').map(String);
      dispatch(
        setUpdateValueRow({
          id,
          colId: Number(colId),
          nvaTime: (types.NVA * Number(pieces)) / Number(layers),
          vaTime: (types.VA * Number(pieces)) / Number(layers),
        })
      );
      dispatch(resetTypes());
      setIsOpen(false);
    },
  });

  return (
    <div className="fixed bg-transparent inset-0 flex justify-center items-center z-50">
      <div className="w-full max-w-sm bg-white flex rounded-md shadow-lg flex-col p-2">
        <div className="border-b border-gray-200 p-3 flex items-center justify-between text-gray-600">
          <h1 className="text-2xl font-bold">Cutting Parameters</h1>
          <div className="p-1 cursor-pointer" onClick={() => setIsOpen(false)}>
            <IoClose size={24} />
          </div>
        </div>
        <form className="space-y-2 p-2" onSubmit={formik.handleSubmit}>
          <div>
            <label
              htmlFor="pieces"
              className="block mb-1 text-base font-medium text-gray-700"
            >
              Number of pieces
            </label>
            <input
              type="number"
              id="pieces"
              name="pieces"
              min={0}
              autoComplete="off"
              value={formik.values.pieces}
              onChange={formik.handleChange}
              className="w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
              placeholder="Enter your pieces..."
            />
            {formik.touched.pieces && formik.errors.pieces ? (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.pieces}
              </div>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="layers"
              className="block mb-1 text-base font-medium text-gray-700"
            >
              Number of layers
            </label>
            <input
              type="number"
              id="layers"
              name="layers"
              min={0}
              autoComplete="off"
              value={formik.values.layers}
              onChange={formik.handleChange}
              className="w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
              placeholder="Enter your layers..."
            />
            {formik.touched.layers && formik.errors.layers ? (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.layers}
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className={`w-full px-2 py-2 cursor-pointer font-medium text-white bg-green-500 rounded-lg hover:bg-green-500 focus:ring-2 focus:ring-green-400`}
            >
              Done
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
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

export default ModalLSA;
