const popupReducer = (state = {}, action) => {
  switch (action.type) {
    case "SHOW":
      return action.payload;
    case "DISMISS":
      return {};
    default:
      return state;
  }
};

export default popupReducer;
