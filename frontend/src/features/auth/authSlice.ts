import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type {
  IAuthResponse,
  IAuthState,
  ILoginPayload,
} from '../../types/auth';
import authApi from '../../api/authApi';

const initialState: IAuthState = {
  auth: (() => {
    try {
      const authData = localStorage.getItem('auth');
      return authData ? JSON.parse(authData) : null;
    } catch (error) {
      return null;
    }
  })(),
  accessToken: localStorage.getItem('accessToken') || null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: ILoginPayload, { rejectWithValue }) => {
    try {
      const { auth, accessToken } = await authApi.login(payload);
      localStorage.setItem('auth', JSON.stringify(auth));
      localStorage.setItem('accessToken', accessToken);
      return { auth, accessToken } as IAuthResponse;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || '');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.auth = null;
      state.accessToken = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('auth');
      localStorage.removeItem('category');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<IAuthResponse>) => {
          state.loading = false;
          state.auth = action.payload.auth;
          state.accessToken = action.payload.accessToken;
          state.error = null;
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
