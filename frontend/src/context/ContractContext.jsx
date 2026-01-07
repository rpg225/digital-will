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

<<<<<<< HEAD
  // 🔍 DEBUG: expose contract to window for console testing
  useEffect(() => {
    if (contract) {
      console.log("🧪 Exposing contract to window.__contract");
    }
  }, [contract]);


  // AUTO-CONNECT IF PREVIOUSLY CONNECTED
  useEffect(() => {
    let mounted = true;

    const checkConnection = async () => {
      if (!mounted) return;

      const wallet = getWalletSource();
      if (!wallet) return;

      try {
        const accounts = await wallet.request({ method: "eth_accounts" });
        if (accounts.length > 0 && mounted) {
          console.log("🔄 Auto-connecting to previously connected wallet...");
          
          // Don't call connectWallet() - just set up the connection directly
          const ethProvider = new ethers.providers.Web3Provider(wallet);
          const signer = ethProvider.getSigner();
          const address = await signer.getAddress();
          const network = await ethProvider.getNetwork();

          console.log("🔗 Auto-connected to network:", network.chainId);

          if (!ALLOWED_CHAINS.includes(network.chainId.toString())) {
            setNetworkError("Wrong network. Use Sepolia or Localhost (31337).");
            return;
          }

          setProvider(ethProvider);
          setSigner(signer);
          setWalletAddress(address);
          setNetworkError(null);
        }
      } catch (err) {
        console.error("Auto-connect error:", err);
      }
    };

    checkConnection();

    return () => {
      mounted = false;
    };
  }, []);

=======
>>>>>>> parent of 52c3490 (Fix: Display all wills including executed ones as transaction history)
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