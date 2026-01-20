import axiosConfig from '../libs/axiosConfig';
import type { IFilter } from '../types/stagelist';
import type { ITableCtPayload, ITableCtResponse } from '../types/tablect';

const tablectApi = {
  getData: async (payload: IFilter): Promise<ITableCtResponse[]> => {
    const res = await axiosConfig.get('tablect/get-data', {
      params: { ...payload },
    });
    return res.data;
  },
  createData: async (payload: ITableCtPayload): Promise<ITableCtResponse> => {
    const res = await axiosConfig.post('tablect/create-data', payload);
    return res.data;
  },
  deleteData: async (Id: string) => {
    const res = await axiosConfig.delete(`tablect/${Id}`);
    return res.data;
  },
  saveData: async (payload: ITableCtPayload) => {
    const res = await axiosConfig.patch('tablect/save-data', payload);
    return res.data;
  },
  confirmData: async (payload: ITableCtPayload[]) => {
    const res = await axiosConfig.patch('tablect/confirm-data', payload);
    return res.data;
  },
  getDepartmentMachineType: async () => {
    const res = await axiosConfig.get('tablect/get-department-machine-type');
    return res.data;
  },
  updateOrder: async (ids: string[]) => {
    const res = await axiosConfig.post('tablect/update-order', { ids });
    return res.data;
  },
};

export default tablectApi;
