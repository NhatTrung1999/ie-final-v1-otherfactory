import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type {
  ITableCtPayload,
  ITableCtResponse,
  ITableCtState,
  ITableData,
} from '../../types/tablect';
import tablectApi from '../../api/tablectApi';
import type { IFilter } from '../../types/stagelist';

export const getData = createAsyncThunk(
  'tablect/get-data',
  async (payload: IFilter, { rejectWithValue }) => {
    try {
      let res = await tablectApi.getData(payload);
      return res;
    } catch (error: any) {
      console.log(error);
      return rejectWithValue(error);
    }
  }
);

export const createData = createAsyncThunk(
  'tablect/create-data',
  async (payload: ITableCtPayload) => {
    try {
      const res = await tablectApi.createData(payload);
      const convertNva = JSON.parse(res.Nva);
      const convertVa = JSON.parse(res.Va);
      return { ...res, Nva: convertNva, Va: convertVa } as ITableData;
    } catch (error: any) {
      console.log(error);
    }
  }
);

export const deleteData = createAsyncThunk(
  'tablect/delete-data',
  async (Id: string) => {
    try {
      const res = await tablectApi.deleteData(Id);
      return res;
    } catch (error: any) {
      console.log(error);
    }
  }
);

export const saveData = createAsyncThunk(
  'tablect/save-data',
  async (payload: ITableCtPayload) => {
    try {
      const res = await tablectApi.saveData(payload);
      return res;
    } catch (error: any) {
      console.log(error);
    }
  }
);

export const confirmData = createAsyncThunk(
  'tablect/confirm-data',
  async (payload: ITableCtPayload[]) => {
    try {
      const res = await tablectApi.confirmData(payload);
      return res;
    } catch (error: any) {
      console.log(error);
    }
  }
);

export const getDepartmentMachineType = createAsyncThunk(
  'tablect/get-department-machine-type',
  async (_, { rejectWithValue }) => {
    try {
      let res = await tablectApi.getDepartmentMachineType();
      return res;
    } catch (error: any) {
      console.log(error);
      return rejectWithValue(error);
    }
  }
);

const initialState: ITableCtState = {
  tablect: [],
  activeColId: null,
  machineTypes: [],
  selectedMachineType: { machineTypeValue: '', Id: '' },
  loading: false,
  error: null,
};

const tablectSlice = createSlice({
  name: 'tablect',
  initialState,
  reducers: {
    setCreateRowData: (state, action: PayloadAction<ITableData>) => {
      state.tablect.push(action.payload);
    },
    setActiveColId: (state, action: PayloadAction<string | null>) => {
      if (state.activeColId === action.payload) {
        state.activeColId = null;
      } else {
        state.activeColId = action.payload;
      }
    },
    setUpdateValueRow: (
      state,
      action: PayloadAction<{
        id: string;
        colId: number;
        nvaTime: number;
        vaTime: number;
      }>
    ) => {
      const { id, colId, nvaTime, vaTime } = action.payload;
      state.tablect.map((item) => {
        if (item.Id === id) {
          item.Nva.Cts[colId] += Number(nvaTime.toFixed(2));
          item.Va.Cts[colId] += Number(vaTime.toFixed(2));
        }
      });
    },
    setUpdateAverage: (
      state,
      action: PayloadAction<{ category: string | null; payload: ITableData }>
    ) => {
      const { category, payload } = action.payload;
      if (
        category?.trim().toLowerCase() === 'FF28'.trim().toLowerCase() ||
        category?.trim().toLowerCase() === 'LSA'.trim().toLowerCase()
      ) {
        const totalNva = payload.Nva.Cts.filter((item) => item > 0) || 0;
        const totalVa = payload.Va.Cts.filter((item) => item > 0) || 0;
        const avgNva =
          payload.Nva.Cts.reduce((prev, curr) => prev + curr, 0) /
            totalNva.length || 0;
        const avgVa =
          payload.Va.Cts.reduce((prev, curr) => prev + curr, 0) /
            totalVa.length || 0;
        state.tablect.map((item) => {
          if (item.Id === payload.Id) {
            item.Nva.Average = Number(avgNva.toFixed(2));
            item.Va.Average = Number(avgVa.toFixed(2));
          }
        });
      } else {
        const item = state.tablect.find((item) => item.Id === payload.Id);
        if (item) {
          const validNvaCts = item.Nva.Cts.filter((ct) => ct > 0);
          const validVaCts = item.Va.Cts.filter((ct) => ct > 0);

          const avgNvaCt =
            validNvaCts.reduce((sum, val) => sum + val, 0) / validNvaCts.length;
          const avgVaCt =
            validVaCts.reduce((sum, val) => sum + val, 0) / validVaCts.length;

          const sumNvaCtBefore = validNvaCts.reduce((sum, val) => sum + val, 0);
          const sumVaCtBefore = validVaCts.reduce((sum, val) => sum + val, 0);

          let sumNvaCtAfter = 0;
          let sumVaCtAfter = 0;

          for (let i = 0; i < item.Nva.Cts.length - 1; i++) {
            const randomOffset = Math.random() * 2 - 1;
            if (item.Nva.Cts[i] === 0) {
              item.Nva.Cts[i] = Number(
                (+avgNvaCt.toFixed(2) + randomOffset).toFixed(2)
              );
              sumNvaCtAfter += item.Nva.Cts[i];
            }
            if (item.Va.Cts[i] === 0) {
              item.Va.Cts[i] = Number(
                (+avgVaCt.toFixed(2) + randomOffset).toFixed(2)
              );
              sumVaCtAfter += item.Va.Cts[i];
            }
          }

          const lastNvaCt =
            +avgNvaCt.toFixed(2) * 10 - sumNvaCtBefore - sumNvaCtAfter;
          const lastVaCt =
            +avgVaCt.toFixed(2) * 10 - sumVaCtBefore - sumVaCtAfter;

          item.Nva.Cts[item.Nva.Cts.length - 1] = Number(lastNvaCt.toFixed(2));

          item.Va.Cts[item.Va.Cts.length - 1] = Number(lastVaCt.toFixed(2));

          const averageNvaCt =
            item.Nva.Cts.reduce((sum, val) => sum + val, 0) /
            item.Nva.Cts.length;

          const averageVaCt =
            item.Va.Cts.reduce((sum, val) => sum + val, 0) / item.Va.Cts.length;

          item.Nva.Average = Number(averageNvaCt.toFixed(2));
          item.Va.Average = Number(averageVaCt.toFixed(2));
        }
      }
    },
    setMachineType: (
      state,
      action: PayloadAction<{ machineTypeValue: string; Id: string }>
    ) => {
      state.selectedMachineType = { ...action.payload };
    },
    setUpdateMachineType: (
      state,
      action: PayloadAction<{ machineTypeValue: string; Id: string }>
    ) => {
      const { machineTypeValue, Id } = action.payload;
      const [machineType, loss] = machineTypeValue.split('_');
      state.tablect.forEach((item) => {
        if (item.Id === Id) {
          item.MachineType = machineType;
          item.Loss = loss;
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getData.fulfilled,
        (state, action: PayloadAction<ITableCtResponse[]>) => {
          state.loading = false;
          state.tablect = action.payload.map((item) => ({
            ...item,
            Nva: JSON.parse(item.Nva),
            Va: JSON.parse(item.Va),
          }));
        }
      )
      .addCase(getData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createData.fulfilled, (state, action) => {
        state.loading = false;
        // state.tablect.push(action.payload as ITableData);
        if (action.payload) {
          state.tablect.push(action.payload);
        }
      })
      .addCase(createData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteData.fulfilled,
        (state, action: PayloadAction<ITableCtResponse[]>) => {
          state.loading = false;
          state.tablect = action.payload.map((item) => ({
            ...item,
            Nva: JSON.parse(item.Nva),
            Va: JSON.parse(item.Va),
          }));
        }
      )
      .addCase(deleteData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(saveData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        saveData.fulfilled,
        (state, action: PayloadAction<ITableCtResponse[]>) => {
          state.loading = false;
          state.tablect = action.payload.map((item) => ({
            ...item,
            Nva: JSON.parse(item.Nva),
            Va: JSON.parse(item.Va),
          }));
        }
      )
      .addCase(saveData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(confirmData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        confirmData.fulfilled,
        (state, action: PayloadAction<ITableCtResponse[]>) => {
          state.loading = false;
          state.tablect = action.payload.map((item) => ({
            ...item,
            Nva: JSON.parse(item.Nva),
            Va: JSON.parse(item.Va),
          }));
        }
      )
      .addCase(confirmData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getDepartmentMachineType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getDepartmentMachineType.fulfilled,
        (
          state,
          action: PayloadAction<
            { MachineTypeCN: string; MachineTypeVN: string; Loss: string }[]
          >
        ) => {
          state.loading = false;
          state.machineTypes = action.payload.map((item) => ({
            value: `${item.MachineTypeCN} - ${item.MachineTypeVN}_${item.Loss}`,
            label: `${item.MachineTypeCN} - ${item.MachineTypeVN}`,
          }));
          // console.log(action.payload);
        }
      )
      .addCase(getDepartmentMachineType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCreateRowData,
  setActiveColId,
  setUpdateValueRow,
  setUpdateAverage,
  setMachineType,
  setUpdateMachineType,
} = tablectSlice.actions;

export default tablectSlice.reducer;
