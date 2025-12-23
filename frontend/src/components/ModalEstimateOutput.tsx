import { IoClose } from 'react-icons/io5';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../app/hooks';

type Props = {
  setIsOpen: (isOpen: boolean) => void;
  activeColId?: string | null;
};

type EstimateFormValues = {
  estimateOutput: number | '';
};

const initialValues: EstimateFormValues  = {
  estimateOutput: '',
};

const validationSchema = Yup.object({
  estimateOutput: Yup.number()
    .typeError('Please enter a number')
    .required('Please enter estimate output')
    .min(1, 'Must be greater than 0'),
});

const ModalEstimateOutput = ({ setIsOpen, activeColId }: Props) => {
  const { types } = useAppSelector((state) => state.controlpanel);
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (data) => {
      console.log(data);
    },
  });

  return (
    <div className="fixed bg-transparent inset-0 flex justify-center items-center z-50">
      <div className="w-full max-w-sm bg-white flex rounded-md shadow-lg flex-col p-2">
        <div className="border-b border-gray-200 p-3 flex items-center justify-between text-gray-600">
          <h1 className="text-2xl font-bold">Modal Estimate Output</h1>
          <div className="p-1 cursor-pointer" onClick={() => setIsOpen(false)}>
            <IoClose size={24} />
          </div>
        </div>
        <form className="space-y-2 p-2" onSubmit={formik.handleSubmit}>
          <div>
            <label
              htmlFor="estimateOutput"
              className="block mb-1 text-base font-medium text-gray-700"
            >
              Estimate Output (pairs / shift)
            </label>
            <input
              type="number"
              id="estimateOutput"
              name="estimateOutput"
              min={0}
              autoComplete="off"
              value={formik.values.estimateOutput}
              onChange={formik.handleChange}
              className="w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
              placeholder="Enter estimate output..."
            />
            {formik.touched.estimateOutput && formik.errors.estimateOutput ? (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.estimateOutput}
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className={`w-full px-2 py-2 cursor-pointer font-medium text-white bg-green-500 rounded-lg hover:bg-green-500 focus:ring-2 focus:ring-green-400`}
            >
              Confirm
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

export default ModalEstimateOutput;
