import axiosConfig from '../libs/axiosConfig';
import type { IFilter } from '../types/stagelist';

const duplicateApi = {
  fetchDuplicateList: async (payload: IFilter) => {
    const res = await axiosConfig.get('duplicate/duplicate-list', {
      params: { ...payload },
    });
    return res.data;
  },
  duplicateStage: async (ids: string[]) => {
    const res = await axiosConfig.post('duplicate/duplicate-stage', {
      ids,
    });
    return res.data;
  },
};

export default duplicateApi;
