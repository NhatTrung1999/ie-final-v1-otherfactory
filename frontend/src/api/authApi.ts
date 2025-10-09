import axiosConfig from '../libs/axiosConfig';
import type { IAuthResponse, ILoginPayload } from '../types/auth';

const authApi = {
  login: async (payload: ILoginPayload): Promise<IAuthResponse> => {
    const res = await axiosConfig.post('auth/login', { ...payload });
    return res.data;
  },
};

export default authApi;
