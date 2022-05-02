const MESSAGES = {
  WEB3_WALLET_NOT_DETECTED: {
    title: "No Web3 Wallet Detected",
    message: "Please install Web3 Wallet to use this dApp",
    buttons: [
      {
        text: "OK",
      },
    ],
  },

  WEB3_WALLET_NOT_CONNECTED: {
    title: "Failed to connect to Web3 Wallet",
    message: "Please connect your wallet",
    buttons: [
      {
        text: "OK",
      },
    ],
  },

  INCORRECT_EVM_CHAIN: {
    title: "Incorrect EVM Chain",
    message: "Please switch network to the correct chain",
    buttons: [
      {
        text: "OK",
      },
    ],
  },

  TITLE_AND_CONTENT_IS_REQUIRED: {
    title: "News Title & Content is Required",
    message: "Please fill in News Title & Content",
    buttons: [
      {
        text: "OK",
      },
    ],
  },

  ARWEAVE_PLUGIN_NOT_DETECTED: {
    title: "Arweave Wallet Plugin not detected",
    message:
      "Arweave Wallet Plugins like Finnie, ArConntect is not detected. Please install in order to upload news",
    buttons: [
      {
        text: "OK",
      },
    ],
  },

  INSUFFICIENT_AR_BALANCE: {
    title: "Insufficient AR Balance",
    message: "Please make sure you have enough AR in your Arweave Address",
    buttons: [
      {
        text: "OK",
      },
    ],
  },
};

export { MESSAGES };
