import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Contract, ethers } from "ethers";
import contractAbi from "../abi/CreateWill.json";
import { contractAddress } from "../utils/contractAddress";

const ContractContext = createContext();

// Allowed networks
const ALLOWED_CHAINS = ["31337", "11155111"];

// Detect Core → Avalanche → MetaMask
function getWalletSource() {
  if (typeof window === "undefined") return null;
  return window.core || window.avalanche || window.ethereum || null;
}

function ContractProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [networkError, setNetworkError] = useState(null);

  // 👇 THIS IS WHERE isConnecting MUST BE
  const [isConnecting, setIsConnecting] = useState(false);

  // CONNECT WALLET
  async function connectWallet() {
    if (isConnecting) return;
    setIsConnecting(true);

    const wallet = getWalletSource();

    if (!wallet) {
      alert("Please install Core Wallet or MetaMask.");
      setIsConnecting(false);
      return;
    }

    try {
      const ethProvider = new ethers.providers.Web3Provider(wallet);
      await wallet.request({ method: "eth_requestAccounts" });

      const signer = ethProvider.getSigner();
      const address = await signer.getAddress();
      const network = await ethProvider.getNetwork();

      if (!ALLOWED_CHAINS.includes(network.chainId.toString())) {
        setNetworkError("Wrong network. Use Sepolia or Localhost (31337).");
        setIsConnecting(false);
        return;
      }

      setProvider(ethProvider);
      setSigner(signer);
      setWalletAddress(address);
      setNetworkError(null);
    } catch (err) {
      console.error("Wallet connection error:", err);
    }

    setIsConnecting(false);
  }

  // DISCONNECT
  function disconnectWallet() {
    setWalletAddress(null);
    setProvider(null);
    setSigner(null);
    setNetworkError(null);
  }

  // CONTRACT INSTANCE
  const contract = useMemo(() => {
    if (!signer) return null;
    return new Contract(contractAddress, contractAbi.abi, signer);
  }, [signer]);

  // EVENT LISTENERS
  useEffect(() => {
    const wallet = getWalletSource();
    if (!wallet?.on) return;

    const handleAccountsChanged = () => disconnectWallet();
    const handleChainChanged = () => disconnectWallet();

    wallet.on("accountsChanged", handleAccountsChanged);
    wallet.on("chainChanged", handleChainChanged);

    return () => {
      wallet.removeListener?.("accountsChanged", handleAccountsChanged);
      wallet.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  return (
    <ContractContext.Provider
      value={{
        walletAddress,
        provider,
        signer,
        contract,
        connectWallet,
        disconnectWallet,
        networkError,
        isConnected: !!walletAddress,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
}

function useContract() {
  return useContext(ContractContext);
}

export { ContractProvider, useContract };