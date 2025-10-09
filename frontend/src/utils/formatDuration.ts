export const formatDuration = (seconds: number): string => {
  //   if (isNaN(seconds) || seconds <= 0) return '00:00:00';
  if (isNaN(seconds) || seconds <= 0) return '00:00';

  //   const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  //   const hh = String(hrs).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  //   return `${hh}:${mm}:${ss}`;
  return `${mm}:${ss}`;
};
