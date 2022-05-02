import { useState } from "react";

export const useWallet = () => {
  const { ethereum } = window;
  const [currentAccount, setCurrentAccount] = useState(
    ethereum?.selectedAddress
  );
  const [currentChain, setCurrentChain] = useState(ethereum?.chainId);

  ethereum?.on("accountsChanged", ([newAccount]) => {
    setCurrentAccount(newAccount);
  });

  ethereum?.on("chainChanged", (chainId) => {
    setCurrentChain(chainId);
  });

  return { currentAccount, setCurrentAccount, currentChain, setCurrentChain };
};
