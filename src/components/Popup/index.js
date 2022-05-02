import "./Popup.scss";
import { useSelector, useDispatch } from "react-redux";
import { dismissPopup } from "../../actions/popup";

const Popup = () => {
  const popup = useSelector((state) => state.popup);
  const dispatch = useDispatch();

  const { title = "", message = "", buttons = [] } = popup;

  return (
    <>
      {message && (
        <div className="backdrop">
          <div className="popup-container">
            <div className="title">{title}</div>
            <div className="message">{message}</div>

            <div className="buttons">
              {buttons.map((button, index) => {
                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (button.callback) button.callback();
                      dispatch(dismissPopup());
                    }}
                    className="button"
                  >
                    {button.text}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
