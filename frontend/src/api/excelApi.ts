import axiosConfig from '../libs/axiosConfig';
import type { IFilter } from '../types/stagelist';

const excelApi = {
  exportLSA: async (payload: IFilter) => {
    const res = await axiosConfig.get('excel/export-lsa', {
      params: { ...payload },
      responseType: 'blob',
    });
    return res.data;
  },
  exportTimeStudy: async (payload: IFilter) => {
    const res = await axiosConfig.get('excel/export-time-study', {
      params: { ...payload },
      responseType: 'blob',
    });
    return res.data;
  },
};

export default excelApi;
