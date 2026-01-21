import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type {
  IFilter,
  IStageList,
  IStageListState,
} from '../../types/stagelist';
import stagelistApi from '../../api/stagelistApi';
import type { IFormModal } from '../../types/modal';

const initialState: IStageListState = {
  stagelist: [],
  activeTabId: 'CUTTING',
  activeItemId: null,
  path: 'null',
  formUploadVideo: {
    date: '',
    season: '',
    stage: '',
    cutDie: '',
    area: '',
    article: '',
  },
  filter: {
    DateFrom: new Date().toISOString().slice(0, 10),
    DateTo: new Date().toISOString().slice(0, 10),
    Season: '',
    Stage: '',
    Area: '',
    Article: '',
    Account: '',
  },
  isSearch: true,
  loading: false,
  error: null,
};

export const stagelistUpload = createAsyncThunk(
  'stagelist/upload',
  async (
    {
      payload,
      onProgress,
      controller,
    }: {
      payload: IFormModal;
      onProgress?: (p: number) => void;
      controller: AbortController;
    },
    { rejectWithValue }
  ) => {
    try {
      const { date, season, stage, cutDie, area, article, files } = payload;
      const formData = new FormData();

      formData.append('date', date.trim());
      formData.append('season', season.toUpperCase().trim());
      formData.append('stage', stage.trim());
      formData.append('cutDie', cutDie.toUpperCase().trim());
      formData.append('area', area.trim());
      formData.append('article', article.toUpperCase().trim());
      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
        }
      }
      const res = await stagelistApi.stagelistUpload(
        formData,
        onProgress,
        controller.signal
      );
      return res as IStageList[];
    } catch (error: any) {
      // console.log(error);
      return rejectWithValue(
        error?.response?.data?.message || 'Upload failed!'
      );
    }
  }
);

export const stagelistList = createAsyncThunk(
  'stagelist/list',
  async (payload: IFilter, { rejectWithValue }) => {
    try {
      const res = await stagelistApi.stagelistList(payload);
      return res as IStageList[];
    } catch (error) {
      return rejectWithValue(error || '');
    }
  }
);

export const stagelistDelete = createAsyncThunk(
  'stagelist/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await stagelistApi.stagelistDelete(id);
      return res as IStageList[];
    } catch (error: any) {
      // console.log(error);
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

export const stagelistUpdateOrder = createAsyncThunk(
  'stagelist/updateOrder',
  async (ids: string[], { rejectWithValue }) => {
    try {
      await stagelistApi.stagelistUpdateOrder(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || 'Update order failed'
      );
    }
  }
);

export const stagelistMarkCompleted = createAsyncThunk(
  'stagelist/mark-completed',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await stagelistApi.stagelistMarkCompleted(id);
      console.log(res);
    } catch (error) {
      return rejectWithValue(error || 'Mark completed is failed!');
    }
  }
);

const stagelistSlice = createSlice({
  name: 'stagelist',
  initialState,
  reducers: {
    setActiveTabId: (state, action: PayloadAction<string>) => {
      state.activeTabId = action.payload;
    },
    setActiveItemId: (state, action: PayloadAction<string | null>) => {
      if (state.activeItemId === action.payload) {
        state.activeItemId = null;
      } else {
        state.activeItemId = action.payload;
      }
    },
    setPath: (state, action: PayloadAction<string>) => {
      state.path = action.payload;
    },
    setFormUploadVideo: (
      state,
      action: PayloadAction<{
        date: string;
        season: string;
        stage: string;
        cutDie: string;
        area: string;
        article: string;
      }>
    ) => {
      state.formUploadVideo = { ...action.payload };
    },
    setFilter: (state, action: PayloadAction<IFilter>) => {
      state.filter = { ...action.payload };
    },
    setIsSearch: (state, action: PayloadAction<boolean>) => {
      state.isSearch = action.payload;
    },
    reorderStagelist: (
      state,
      action: PayloadAction<{ activeId: string; overId: string }>
    ) => {
      const { activeId, overId } = action.payload;
      const oldIndex = state.stagelist.findIndex(
        (item) => item.Id === activeId
      );
      const newIndex = state.stagelist.findIndex((item) => item.Id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const [movedItem] = state.stagelist.splice(oldIndex, 1);
        state.stagelist.splice(newIndex, 0, movedItem);
      }
    },
  },
  extraReducers: (builder) => {
    //upload
    builder
      .addCase(stagelistUpload.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        stagelistUpload.fulfilled,
        (state, action: PayloadAction<IStageList[]>) => {
          state.loading = false;
          action.payload.map((item) => state.stagelist.push(item));
        }
      )
      .addCase(stagelistUpload.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // get list
    builder
      .addCase(stagelistList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        stagelistList.fulfilled,
        (state, action: PayloadAction<IStageList[]>) => {
          state.loading = false;
          state.stagelist = action.payload;
        }
      )
      .addCase(stagelistList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //delete
    builder
      .addCase(stagelistDelete.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(stagelistDelete.fulfilled, (state, action) => {
        state.loading = false;
        state.stagelist = action.payload;
      })
      .addCase(stagelistDelete.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setActiveTabId,
  setPath,
  setActiveItemId,
  setFormUploadVideo,
  setFilter,
  setIsSearch,
  reorderStagelist,
} = stagelistSlice.actions;

export default stagelistSlice.reducer;
