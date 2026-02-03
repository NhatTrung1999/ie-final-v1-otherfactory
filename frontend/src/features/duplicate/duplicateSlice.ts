import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { IFilter, IStageList } from '../../types/stagelist';
import duplicateApi from '../../api/duplicateApi';

interface IDuplicateState {
  duplicate: IStageList[];
  loading: boolean;
  error: string | null;
}

export const fetchDuplicateList = createAsyncThunk(
  'duplicate/list',
  async (payload: IFilter, { rejectWithValue }) => {
    try {
      const res = await duplicateApi.fetchDuplicateList(payload);
      return res as IStageList[];
    } catch (error) {
      return rejectWithValue(error || '');
    }
  }
);

export const duplicateStage = createAsyncThunk(
  'duplicate/stage',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await duplicateApi.duplicateStage(ids);
      return res
    } catch (error: any) {
      return rejectWithValue(error.message || 'Duplicate failed!');
    }
  }
);

const initialState: IDuplicateState = {
  duplicate: [],
  loading: false,
  error: null,
};

const duplicateSlice = createSlice({
  name: 'duplicate',
  initialState,
  reducers: {
    resetDuplicateState: (state) => {
      state.duplicate = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDuplicateList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDuplicateList.fulfilled,
        (state, action: PayloadAction<IStageList[]>) => {
          state.loading = false;
          state.duplicate = action.payload;
        }
      )
      .addCase(fetchDuplicateList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetDuplicateState } = duplicateSlice.actions;

export default duplicateSlice.reducer;
