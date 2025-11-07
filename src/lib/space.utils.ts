/** Helper function to get time window label */
export const getTimeWindowLabel = (timeWindowType: string): string => {
  switch (timeWindowType) {
    case 'year':
      return 'annual';
    case 'month':
      return 'monthly';
    case 'week':
      return 'weekly';
    case 'day':
      return 'daily';
    default:
      return 'monthly';
  }
};
