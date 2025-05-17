// Gender options
export const GENDER = {
  PUTRA: 'putra',
  PUTRI: 'putri',
};

// Helper functions
export const isValidGender = (gender) => {
  return Object.values(GENDER).includes(gender?.toLowerCase());
};
