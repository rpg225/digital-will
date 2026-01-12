import { motion } from "framer-motion";
import { useContract } from "../../../context/ContractContext";
import truncate from "../../../utils/truncate";

const ConnectWalletButton = () => {
  const { connectWallet, walletAddress, isConnected, isConnecting } = useContract();

  return (
    <>
      {!isConnected ? (
        <motion.button
          type="button"
          onClick={connectWallet}
          disabled={isConnecting}
          role="button"
          aria-label="Connect wallet"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={
            !isConnecting
              ? {
                  scale: 1.05,
                  boxShadow: "0px 6px 22px rgba(212, 175, 55, 0.45)",
                }
              : {}
          }
          whileTap={!isConnecting ? { scale: 0.95 } : {}}
          transition={{ duration: 0.25 }}
          className={`
            px-6 py-3 rounded-xl
            bg-gold text-navy
            font-semibold tracking-wide
            border border-gold/80
            shadow-md
            transition-all duration-300
            cursor-pointer
            hover:brightness-110
            focus:outline-none focus:ring-2 focus:ring-gold/60
            disabled:opacity-60
            disabled:cursor-not-allowed
          `}
        >
          {isConnecting ? "Connecting…" : "Connect Wallet"}
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="
            px-6 py-3 rounded-xl
            bg-white/10 backdrop-blur-lg
            text-gold
            border border-gold/50
            shadow-inner
            tracking-wide
            font-medium
            cursor-default
            select-none
          "
          title={walletAddress}
        >
          {truncate(walletAddress)}
        </motion.div>
      )}
    </>
  );
};

export default ConnectWalletButton;
