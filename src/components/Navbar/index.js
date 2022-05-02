import "./Navbar.scss";
import { AccountBalanceWalletOutlined } from "@material-ui/icons";
import { ErrorOutline } from "@material-ui/icons";
import MaterialTooltip from "@material-ui/core/Tooltip";
import { useWallet } from "../../hooks/useWallet";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showPopup } from "../../actions/popup";
import { MESSAGES } from "../../tools/PopupHelper";
import { useCallback, useEffect } from "react";

const Navbar = () => {
  const { ethereum } = window;
  const { currentAccount, setCurrentAccount, currentChain, setCurrentChain } =
    useWallet();
  const location = useLocation();
  const dispatch = useDispatch();

  const connectWallet = useCallback(async () => {
    if (!ethereum) {
      dispatch(showPopup(MESSAGES.WEB3_WALLET_NOT_DETECTED));
      return;
    }

    try {
      const [account] = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(account);
      setCurrentChain(ethereum.chainId);
    } catch (err) {
      console.log(err);
      dispatch(
        showPopup({
          title: "Failed to connect Web3 Wallet",
          message: "Cannot connect to the Web3 Wallet, please try again.",
          buttons: [
            {
              text: "Cancel",
            },
            {
              text: "Try Again",
              callback: connectWallet,
            },
          ],
        })
      );
    }
  }, [dispatch, ethereum, setCurrentAccount, setCurrentChain]);

  const switchNetwork = async () => {
    console.log(process.env);
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: process.env.REACT_APP_CHAIN_ID }],
      });
    } catch (err) {
      if (err.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainName: process.env.REACT_APP_CHAIN_NAME,
              chainId: process.env.REACT_APP_CHAIN_ID,
              nativeCurrency: {
                name: process.env.REACT_APP_CHAIN_CURRENCY_NAME,
                decimals: parseInt(
                  process.env.REACT_APP_CHAIN_CURRENCY_DECIMAL
                ),
                symbol: process.env.REACT_APP_CHAIN_CURRENCY_SYMBOL,
              },
              rpcUrls: [process.env.REACT_APP_CHAIN_RPC],
            },
          ],
        });
      } else if (err.code === 4001) {
        dispatch(
          showPopup({
            title: "Cannot Change Network",
            message: `dNews runs on ${process.env.REACT_APP_CHAIN_NAME}, please switch to ${process.env.REACT_APP_CHAIN_NAME} in order to use dNews.`,
            buttons: [
              {
                text: "OK",
              },
            ],
          })
        );
      }
    }
  };

  const isChainCorrect = () => {
    return currentChain === process.env.REACT_APP_CHAIN_ID;
  };

  useEffect(() => {
    if (location && location.pathname === "/news/create") {
      connectWallet();
    }
  }, [location, connectWallet]);

  return (
    <div className="navbar">
      <a href="/news">
        <div className="logo">DNews</div>
      </a>
      <ul>
        <a href="/news">
          <li className={location?.pathname === "/news" ? "selected" : ""}>
            Home
          </li>
        </a>
        <a href="/news/create">
          <li
            className={location?.pathname === "/news/create" ? "selected" : ""}
          >
            Add News
          </li>
        </a>
      </ul>

      {!currentAccount && (
        <div className="connect-wallet-btn" onClick={() => connectWallet()}>
          <AccountBalanceWalletOutlined className="icon" /> Connect Wallet
        </div>
      )}

      {currentAccount && isChainCorrect() && (
        <MaterialTooltip title={currentAccount}>
          <div className="wallet-address">{currentAccount}</div>
        </MaterialTooltip>
      )}

      {currentAccount && !isChainCorrect() && (
        <div className="incorrect-chain" onClick={() => switchNetwork()}>
          <ErrorOutline className="icon" />
          Switch Network
        </div>
      )}
    </div>
  );
};

export default Navbar;
