import { useCallback, useEffect, useState } from "react";
import "./AddNews.scss";
import { useDispatch } from "react-redux";
import { showPopup } from "../../actions/popup";
import Arweave from "arweave";
import { MESSAGES } from "../../tools/PopupHelper";
import Skeleton from "react-loading-skeleton";
import LoadingSpin from "react-loading-spin";
import { useWallet } from "../../hooks/useWallet";
import News from "../../class/News";
import { BuildArweaveUrl, ReadFileToBuffer } from "../../tools/Toolkit";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CreateNewsArticle } from "../../tools/DNews";

const AddNews = () => {
  const chainName = process.env.REACT_APP_CHAIN_NAME;
  const [inputs, setInputs] = useState({});
  const [arAddress, setArAddress] = useState("");
  const [arBalance, setArBalance] = useState(-1);
  const [arweave] = useState(
    Arweave.init({
      host: process.env.REACT_APP_ARWEAVE_HOST,
      port: 443,
      protocol: "https",
      timeout: 20000,
      logging: false,
    })
  );
  const [isUploading, setIsUploading] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const { currentAccount, currentChain } = useWallet();
  const [news, setNews] = useState(null);
  const dispatch = useDispatch();

  const uploadFile = async (file, type) => {
    setProgressMessage(`Reading ${type}`);
    let data = null;
    let filetype = null;
    if (file instanceof File) {
      data = await ReadFileToBuffer(file);
      filetype = file.type;
    } else if (typeof file === "string") {
      data = file;
      filetype = "application/json";
    } else {
      setUploadError("Invalid file");
      return;
    }
    setProgressMessage(`Creating upload ${type} transaction`);
    let transaction = await arweave.createTransaction({
      data: data,
    });
    transaction.addTag("Content-Type", filetype);
    setProgressMessage(`Waiting ${type} upload transaction to be signed`);
    await arweave.transactions.sign(transaction);

    setProgressMessage(`Submitting ${type} upload transaction to Arweave`);
    let uploader = await arweave.transactions.getUploader(transaction);
    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      setProgressMessage(
        `Uploading ${type}: ${uploader.pctComplete}% completed [${uploader.uploadedChunks}/${uploader.totalChunks}]`
      );
    }
    setProgressMessage(`${type} upload completed ${transaction.id}]`);
    return transaction.id;
  };

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.files ? event.target.files : event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setUploadError("");
    // Check input fields
    if (!inputs.title || !inputs.content) {
      dispatchPopup(MESSAGES.TITLE_AND_CONTENT_IS_REQUIRED);
      return;
    }

    // Check Arweave
    if (!arAddress) {
      dispatchPopup(MESSAGES.FAILED_TO_CONNECT_AR_PLUGIN);
      return;
    }

    if (parseFloat(arBalance) === 0) {
      dispatchPopup(MESSAGES.INSUFFICIENT_AR_BALANCE);
      return;
    }

    // Check Ethereum
    if (!currentAccount) {
      dispatchPopup(MESSAGES.WEB3_WALLET_NOT_CONNECTED);
      return;
    }

    if (currentChain !== process.env.REACT_APP_CHAIN_ID) {
      dispatchPopup(MESSAGES.INCORRECT_EVM_CHAIN);
      return;
    }

    setNews(new News(inputs.title, inputs.content));
    setIsUploading(true);
    setProgressMessage("Started to upload news");

    try {
      if (inputs.coverImage && inputs.coverImage.length > 0) {
        let transactionId = await uploadFile(
          inputs.coverImage[0],
          "Cover Image"
        );

        setNews((updatedNews) => {
          updatedNews.cover_image = BuildArweaveUrl(transactionId);
          return updatedNews;
        });
      }

      if (inputs.images && inputs.images.length > 0) {
        for (let i = 0; i < inputs.images.length; i++) {
          let transactionId = await uploadFile(
            inputs.images[i],
            `Image ${i + 1}`
          );
          setNews((updatedNews) => {
            updatedNews.images.push(BuildArweaveUrl(transactionId));
            return updatedNews;
          });
        }
      }

      if (inputs.videos && inputs.videos.length > 0) {
        for (let i = 0; i < inputs.videos.length; i++) {
          let transactionId = await uploadFile(
            inputs.videos[i],
            `Video ${i + 1}`
          );
          setNews((updatedNews) => {
            updatedNews.videos.push(BuildArweaveUrl(transactionId));
            return updatedNews;
          });
        }
      }

      let transactionId = await uploadFile(JSON.stringify(news), "News File");
      const newsUrl = BuildArweaveUrl(transactionId);
      // const newsUrl =
      //   "https://arweave.net/1SdeTB_Itiu9xqCSL1qNipYVv43SwpCGWazXdOZgr48";

      setProgressMessage("Waiting for blockchain transaction to be signed");

      const accounts = await window.ethereum.enable();
      const account = accounts[0];

      const request = CreateNewsArticle(newsUrl, account)
        .then((receipt) => {
          setProgressMessage("Upload completed");
        })
        .catch((error) => {
          onError(error);
          setIsUploading(false);
        });

      toast.promise(
        request,
        {
          pending: "Submitting to the blockchain",
          success: "News Created Successfully!",
          error: "Failed to create news",
        },
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
    } catch (e) {
      console.error(e);
      onError(e);
      setIsUploading(false);
    }
  };

  const onError = (e) => {
    let errorMessage = "";
    if (typeof e === "object") {
      if (e.message) errorMessage = e.message;
      else errorMessage = JSON.stringify(e);
    } else if (typeof e === "string") {
      errorMessage = e;
    }

    setUploadError(errorMessage);

    toast.error("Failed!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const dispatchPopup = useCallback(
    (message) => {
      dispatch(showPopup(message));
    },
    [dispatch]
  );

  const connectArWallet = useCallback(() => {
    window.arweaveWallet
      .connect("ACCESS_ADDRESS")
      .then((x) => {
        window.arweaveWallet.getActiveAddress().then((address) => {
          setArAddress(address);
        });
      })
      .catch((e) => {
        console.error(e);
        dispatch(
          showPopup({
            title: "Failed to connect Arweave Plugin",
            message: "Cannot connect to the Arweave plugin",
            buttons: [
              {
                text: "OK",
              },
              {
                text: "Try Again",
                callback: connectArWallet,
              },
            ],
          })
        );
      });
  }, [dispatch]);

  useEffect(() => {
    if (arAddress) {
      arweave.wallets.getBalance(arAddress).then((balance) => {
        let ar = arweave.ar.winstonToAr(balance);
        setArBalance(ar);
      });
    }
  }, [arAddress, arweave]);

  useEffect(() => {
    if (parseFloat(arBalance) === 0.0) {
      dispatchPopup(MESSAGES.INSUFFICIENT_AR_BALANCE);
    }
  }, [arBalance, dispatchPopup]);

  useEffect(() => {
    setTimeout(() => {
      if (window.arweaveWallet === undefined) {
        dispatchPopup(MESSAGES.ARWEAVE_PLUGIN_NOT_DETECTED);
      } else {
        connectArWallet();
      }
    }, 500);
  }, [dispatchPopup, connectArWallet]);

  return (
    <div className="add-news">
      <h1>Add News</h1>
      <div className="header-description">
        The news will be stored on Arweave and {chainName} permanently.
      </div>

      <form onSubmit={submit}>
        <div className="fields">
          <div className="form-group">
            Title*
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={inputs.title || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            Cover Image
            <input
              name="coverImage"
              type="file"
              accept=".jpg, .png, .jpeg, .webp"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            Images
            <input
              type="file"
              name="images"
              multiple={true}
              accept=".jpg, .png, .jpeg, .webp"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            Videos
            <input
              type="file"
              name="videos"
              multiple={true}
              accept=".mp4"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            News Content*
            <textarea
              name="content"
              placeholder="News Content"
              rows="10"
              value={inputs.content || ""}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <div className="ar-info">
            Your Arweave Wallet
            <a
              className="get-free-ar"
              href="https://faucet.arweave.net"
              rel="noreferrer"
              target="_blank"
            >
              (Get free AR)
            </a>
            {arAddress && (
              <>
                <div>Address: {arAddress}</div>
                <div className="balance">
                  Balance:
                  {arBalance === -1 && (
                    <Skeleton className="ar-info-skeleton" />
                  )}
                  {arBalance > -1 && (
                    <div className="value">{arBalance} AR</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="upload-status">
          {isUploading && (
            <>
              <div className="loading-spin">
                <LoadingSpin primaryColor="#37372c" size="10px" width="2px" />
              </div>
              <div className="progress-message">{progressMessage}</div>
            </>
          )}
          {uploadError && <div className="upload-error">{uploadError}</div>}
        </div>
        {!isUploading && (
          <input type="submit" className="upload-btn" value="Add News" />
        )}
      </form>
    </div>
  );
};

export default AddNews;
