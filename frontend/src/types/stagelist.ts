export const TAB_STAGE_LIST: string[] = [
  'CUTTING',
  'STITCHING',
  'ASSEMBLY',
  'STOCKFITTING',
  'NOSEW',
];

export interface IStageList {
  Id: string;
  Date: string;
  Season: string;
  Stage: string;
  Area: string;
  Article: string;
  Name: string;
  Path: string;
  CreatedBy: string;
  CreatedFactory: string;
  CreatedAt: string;
}

export interface IFilter {
  DateFrom?: string;
  DateTo?: string;
  Season?: string;
  Stage?: string;
  Area?: string;
  Article?: string;
  Account?: string;
}

export interface IStageListState {
  stagelist: IStageList[];
  activeTabId: string;
  activeItemId: string | null;
  path: string | undefined;
  loading: boolean;
  error: string | null;
  formUploadVideo: {
    date: string;
    season: string;
    stage: string;
    cutDie: string;
    area: string;
    article: string;
  };
  filter?: IFilter;
}
