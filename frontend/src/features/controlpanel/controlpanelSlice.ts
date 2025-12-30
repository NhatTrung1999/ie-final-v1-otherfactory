import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IControlPanelState } from '../../types/controlpanel';

const initialState: IControlPanelState = {
  isPlaying: false,
  duration: 0,
  currentTime: 0,
  startTime: 0,
  stopTime: 0,
  types: {
    NVA: 0,
    VA: 0,
    SKIP: 0,
  },
};

const controlpanelSlice = createSlice({
  name: 'controlpanel',
  initialState,
  reducers: {
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setStartTime: (state, action: PayloadAction<number>) => {
      state.startTime = action.payload;
    },
    setStopTime: (state, action: PayloadAction<number>) => {
      state.stopTime = action.payload;
    },
    setTypes: (
      state,
      action: PayloadAction<{ type: string; valueTime: number }>
    ) => {
      const { type, valueTime } = action.payload;
      console.log(type, valueTime);
      state.types[type] += valueTime;
    },
    setDiffTypes: (
      state,
      action: PayloadAction<{ type: string; valueTime: number }>
    ) => {
      const { type, valueTime } = action.payload;
      const newValueTime = state.types[type] - valueTime;
      state.types[type] = newValueTime < 0 ? 0 : newValueTime;
    },
    resetTypes: (state) => {
      state.types = { ...state.types, NVA: 0, VA: 0, SKIP: 0 };
    },
  },
});

export const {
  setIsPlaying,
  setDuration,
  setCurrentTime,
  setStartTime,
  setStopTime,
  setTypes,
  setDiffTypes,
  resetTypes,
} = controlpanelSlice.actions;

export default controlpanelSlice.reducer;
