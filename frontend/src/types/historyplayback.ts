export interface IHistoryplaybackPayload {
  Id: string;
  HistoryPlaybackId: string;
  Type: string;
  Start: string;
  Stop: string;
  CreatedBy: string;
  CreatedFactory: string;
}

export interface IHistoryplaybackData {
  Id: string;
  HistoryPlaybackId: string;
  Type: string;
  Start: string;
  Stop: string;
  CreatedBy: string;
  CreatedFactory: string;
  CreatedAt: string;
}

export interface IHistoryplaybackState {
  historyplayback: IHistoryplaybackData[];
  loading: boolean;
  error: string | null;
}
