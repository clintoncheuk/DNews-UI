export const showPopup = (value) => {
  return {
    type: "SHOW",
    payload: value,
  };
};

export const dismissPopup = () => {
  return {
    type: "DISMISS",
  };
};
