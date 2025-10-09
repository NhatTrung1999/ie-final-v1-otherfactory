import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import historyplaybackApi from '../../api/historyplaybackApi';
import type {
  IHistoryplaybackData,
  IHistoryplaybackPayload,
  IHistoryplaybackState,
} from '../../types/historyplayback';

export const historyplaybackList = createAsyncThunk(
  'historyplayback/historyplayback-list',
  async () => {
    const res = await historyplaybackApi.historyplaybackList();
    return res as IHistoryplaybackData[];
  }
);

export const historyplaybackCreate = createAsyncThunk(
  'historyplayback/historyplayback-create',
  async (payload: IHistoryplaybackPayload, { rejectWithValue }) => {
    try {
      const res = await historyplaybackApi.historyplaybackCreate(payload);
      return res as IHistoryplaybackData;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const historyplaybackDelete = createAsyncThunk(
  'historyplayback/historyplayback-delete',
  async (Id: string) => {
    const res = await historyplaybackApi.historyplaybackDelete(Id);
    return res;
  }
);

export const historyplaybackDeleteMultiple = createAsyncThunk(
  'historyplayback/historyplayback-delete-multiple',
  async (HistoryPlaybackId: string) => {
    const res = await historyplaybackApi.historyplaybackDeleteMultiple(
      HistoryPlaybackId
    );
    return res;
  }
);

const initialState: IHistoryplaybackState = {
  historyplayback: [],
  loading: false,
  error: null,
};

const historyplaybackSlice = createSlice({
  name: 'historyplayback',
  initialState,
  reducers: {
    setHistoryplaybackCreate: (
      state,
      action: PayloadAction<IHistoryplaybackData>
    ) => {
      state.historyplayback.push(action.payload);
    },
    setHistoryplaybackDelete: (state, action: PayloadAction<string>) => {
      // console.log(action.payload);
      state.historyplayback = state.historyplayback.filter(
        (item) => item.Id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    //get list
    builder
      .addCase(historyplaybackList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        historyplaybackList.fulfilled,
        (state, action: PayloadAction<IHistoryplaybackData[]>) => {
          state.loading = false;
          state.historyplayback = action.payload;
        }
      )
      .addCase(historyplaybackList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(historyplaybackCreate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        historyplaybackCreate.fulfilled,
        (state, action: PayloadAction<IHistoryplaybackData>) => {
          state.loading = false;
          state.historyplayback.unshift(action.payload);
        }
      )
      .addCase(historyplaybackCreate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(historyplaybackDelete.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        historyplaybackDelete.fulfilled,
        (state, action: PayloadAction<IHistoryplaybackData[]>) => {
          state.loading = false;
          state.historyplayback = action.payload;
        }
      )
      .addCase(historyplaybackDelete.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(historyplaybackDeleteMultiple.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        historyplaybackDeleteMultiple.fulfilled,
        (state, action: PayloadAction<IHistoryplaybackData[]>) => {
          state.loading = false;
          state.historyplayback = action.payload;
        }
      )
      .addCase(historyplaybackDeleteMultiple.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setHistoryplaybackCreate, setHistoryplaybackDelete } =
  historyplaybackSlice.actions;

export default historyplaybackSlice.reducer;
