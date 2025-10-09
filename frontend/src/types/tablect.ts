export interface ITableHeader {
  No: string;
  ProgressStagePartName: string;
  Type: string;
  Cts: number;
  Average: string;
  MachineType: string;
  Confirm: string;
  Action: string;
}

export interface ITableCtPayload {
  Id: string;
  TablectId?: string;
  No: string;
  ProgressStagePartName: string;
  Area: string;
  Path: string;
  Nva: string;
  Va: string;
  MachineType: string;
  Loss?: string;
  ConfirmId?: string;
  CreatedBy: string;
  IsSave?: boolean;
}

export interface ITableCtResponse {
  Id: string;
  TablectId: string;
  No: string;
  ProgressStagePartName: string;
  Area: string;
  Path: string;
  Nva: string;
  Va: string;
  MachineType: string;
  ConfirmId: string;
  IsSave?: boolean;
  CreatedBy: string;
  CreatedAt: string;
}

export interface ITableData {
  Id: string;
  TablectId: string;
  No: string;
  ProgressStagePartName: string;
  Area: string;
  Path: string;
  Nva: {
    Type: string;
    Cts: number[];
    Average: number;
  };
  Va: {
    Type: string;
    Cts: number[];
    Average: number;
  };
  MachineType: string;
  Loss?: string;
  ConfirmId: string;
  IsSave?: boolean;
  CreatedBy: string;
  CreatedAt: string;
}

export const TABLE_HEADER: ITableHeader[] = [
  {
    No: 'No',
    ProgressStagePartName: 'Progress Stage Part Name',
    Type: 'Type',
    Cts: 10,
    Average: 'Average',
    MachineType: 'Machine Type',
    Confirm: 'Confirm',
    Action: 'Action',
  },
];

export interface ITableCtState {
  tablect: ITableData[];
  activeColId: string | null;
  machineTypes: { value: string; label: string }[];
  selectedMachineType: { machineTypeValue: string; Id: string };
  loading: boolean;
  error: string | null;
}

// export const TABLE_DATA: ITableData[] = [
//   {
//     Id: '1',
//     No: 'C1',
//     ProgressStagePartName: 'Test',
//     Area: 'CUTTING',
//     Path: '/path.json',
//     Nva: {
//       Type: 'NVA',
//       Cts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//       Average: 0,
//     },
//     Va: {
//       Type: 'VA',
//       Cts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//       Average: 0,
//     },
//     MachineType: '',
//     ConfirmId: '26324',
//   },
// ];
