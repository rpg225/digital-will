import React from "react";
import TruncatedAddress from "../TruncatedAddress";
import CountdownTimer from "../../hooks/CountdownTimer";
import { ethers } from "ethers";
import { motion } from "framer-motion";

const statusColors = {
  "Executed": "bg-green-600/20 text-green-300 border-green-600/40",
  "Active": "bg-blue-600/20 text-blue-300 border-blue-600/40",
  "Ready to Execute": "bg-yellow-600/20 text-yellow-300 border-yellow-600/40",
  "Expired": "bg-red-600/20 text-red-300 border-red-600/40",
  "Cancelled": "bg-gray-600/20 text-gray-300 border-gray-600/40"
};

const WillsCard = ({ deathTimeout, status, address, balance, lastPing, timeLeft, cancelled }) => {

  // Convert BigNumber values to readable formats
  const formattedBalance = ethers.utils.formatEther(
    ethers.BigNumber.isBigNumber(balance) ? balance : ethers.BigNumber.from(balance || 0)
  );

  const deathTimeoutSeconds = ethers.BigNumber.isBigNumber(deathTimeout) 
    ? deathTimeout.toString() 
    : deathTimeout?.toString() || "0";

  const lastPingTimestamp = ethers.BigNumber.isBigNumber(lastPing)
    ? lastPing.toString()
    : lastPing?.toString() || "0";

  const isCancelled = typeof cancelled === 'boolean' 
    ? cancelled 
    : cancelled === true || cancelled === "Yes";

  const resolvedStatus = isCancelled ? "Cancelled" : status;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="
        bg-[#0B1B34]/60 
        backdrop-blur-xl 
        border border-gold/30 
        rounded-2xl 
        shadow-lg 
        p-6 
        mb-6
        transition-all duration-300
        hover:border-gold/60 hover:shadow-gold/20
      "
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gold font-serif text-2xl tracking-wide">
          Will Document
        </h2>

        <span className={`
          px-3 py-1 rounded-lg text-sm border 
          ${statusColors[resolvedStatus] || "bg-slate/20 text-slate-300 border-slate-500/40"}
        `}>
          {resolvedStatus}
        </span>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-y-3 text-slate-200">

        <div>
          <p className="text-gold font-semibold">Owner</p>
          <TruncatedAddress address={address} className="text-white" />
        </div>

        <div>
          <p className="text-gold font-semibold">Balance</p>
          <p className="text-white">{parseFloat(formattedBalance).toFixed(4)} ETH</p>
        </div>

        <div>
          <p className="text-gold font-semibold">Time Left</p>
          {timeLeft > 0 ? (
            <CountdownTimer 
              lastPing={parseInt(lastPingTimestamp)} 
              deathTimeout={parseInt(deathTimeoutSeconds)} 
            />
          ) : (
            <p className="text-red-300">Expired</p>
          )}
        </div>

        <div>
          <p className="text-gold font-semibold">Death Timeout</p>
          <p className="text-white">
            {deathTimeoutSeconds} sec ({(parseInt(deathTimeoutSeconds) / 86400).toFixed(1)} days)
          </p>
        </div>

        <div>
          <p className="text-gold font-semibold">Last Ping</p>
          <p className="text-white">
            {new Date(parseInt(lastPingTimestamp) * 1000).toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-gold font-semibold">Cancelled</p>
          <p className="text-white">{isCancelled ? "Yes" : "No"}</p>
        </div>

      </div>
    </motion.div>
  );
};

export default WillsCard;