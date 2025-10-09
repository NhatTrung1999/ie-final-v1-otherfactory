import axiosConfig from '../libs/axiosConfig';
import type { IHistoryplaybackPayload } from '../types/historyplayback';

const historyplaybackApi = {
  historyplaybackList: async () => {
    const res = await axiosConfig.get('historyplayback/historyplayback-list');
    return res.data;
  },
  historyplaybackCreate: async (payload: IHistoryplaybackPayload) => {
    const res = await axiosConfig.post(
      'historyplayback/historyplayback-create',
      payload
    );
    return res.data;
  },
  historyplaybackDelete: async (Id: string) => {
    const res = await axiosConfig.delete(
      `historyplayback/historyplayback-delete?Id=${Id}`
    );
    return res.data;
  },
  historyplaybackDeleteMultiple: async (HistoryPlaybackId: string) => {
    const res = await axiosConfig.delete(
      `historyplayback/historyplayback-delete-multiple?HistoryPlaybackId=${HistoryPlaybackId}`
    );
    return res.data;
  },
};

export default historyplaybackApi;
