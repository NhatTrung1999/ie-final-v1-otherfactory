export interface IControlPanelState {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  startTime: number;
  stopTime: number;
  types: {
    [key in string]: number;
  };
}
