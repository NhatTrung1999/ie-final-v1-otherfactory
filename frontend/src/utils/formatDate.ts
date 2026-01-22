import dayjs from 'dayjs';

export const formatDate = (time?: string | null) => {
  if (!time) return '';
  const date = dayjs(time);
  if (!date.isValid()) return '';
  return date.format('YYYY-MM-DD');
};
