import { motion } from "framer-motion";
import { useContract } from "../../../context/ContractContext";
import truncate from "../../../utils/truncate";


const ConnectWalletButton = () => {
  const { connectWallet, walletAddress, isConnected } = useContract();

  return (
    <>
      {!isConnected ? (
        <motion.button
          onClick={connectWallet}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{
            scale: 1.05,
            boxShadow: "0px 4px 18px rgba(212, 175, 55, 0.35)",
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="px-6 py-3 rounded-xl 
                     bg-gold text-navy 
                     font-semibold tracking-wide 
                     shadow-md hover:shadow-xl
                     border border-gold/80 
                     transition-all duration-300"
        >
          Connect Wallet
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 py-3 rounded-xl 
                     bg-white/10 backdrop-blur-lg 
                     text-gold 
                     border border-gold/50 
                     shadow-inner tracking-wide
                     font-medium"
        >
          {truncate(walletAddress)}
        </motion.div>
      )}
    </>
  );
};

export default ConnectWalletButton;
