import axiosConfig from '../libs/axiosConfig';
import type { IFilter } from '../types/stagelist';

const stagelistApi = {
  stagelistUpload: async (
    payload: FormData,
    onProgress?: (percent: number) => void,
    cancelSign?: AbortSignal
  ) => {
    const res = await axiosConfig.post('stagelist/stagelist-upload', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
      signal: cancelSign,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        }
      },
    });
    return res.data;
  },
  stagelistList: async (payload: IFilter) => {
    const res = await axiosConfig.get('stagelist/stagelist-list', {
      params: { ...payload },
    });
    return res.data;
  },
  stagelistDelete: async (id: string) => {
    const res = await axiosConfig.delete(`stagelist/stagelist-delete/${id}`);
    return res.data;
  },
};

export default stagelistApi;
