import React from "react";
import TruncatedAddress from "../TruncatedAddress";
import { useContract } from "../../context/ContractContext";
import CountdownTimer from "../../hooks/CountdownTimer";
import { ethers } from "ethers";
import { motion } from "framer-motion";


const statusColors = {
  Executed: "bg-green-600/20 text-green-300 border-green-600/40",
  Active: "bg-blue-600/20 text-blue-300 border-blue-600/40",
  "Ready to Execute": "bg-yellow-600/20 text-yellow-300 border-yellow-600/40",
  Expired: "bg-red-600/20 text-red-300 border-red-600/40",
  Cancelled: "bg-gray-600/20 text-gray-300 border-gray-600/40",
};

const toEth = (v) => {
  if (!v) return 0;
  if (ethers.BigNumber.isBigNumber(v)) {
    return Number(ethers.utils.formatEther(v));
  }
  return Number(v); // already ETH string/number
};

<<<<<<< HEAD
const WillsCard = ({
  deathTimeout,
  status,
  address,
  balance,
  totalDeposited,
  lastPing,
  timeLeft,
  cancelled,
  beneficiaries = [],
  amounts = [],
}) => {
  const { walletAddress } = useContract();

  const balanceEth = ethers.utils.formatEther(balance);
  const amountsEth = amounts.map(toEth);
  const totalSentEth = amountsEth.reduce((s, a) => s + a, 0);
  const totalDepositedEth = ethers.utils.formatEther(totalDeposited);

  const deathTimeoutSeconds = Number(
    ethers.BigNumber.isBigNumber(deathTimeout)
      ? deathTimeout.toString()
      : deathTimeout || 0
  );

  const lastPingTimestamp = Number(
    ethers.BigNumber.isBigNumber(lastPing)
      ? lastPing.toString()
      : lastPing || 0
  );

  const resolvedStatus = cancelled ? "Cancelled" : status;
=======
  const formattedBalance = parseFloat(
    ethers.utils.formatEther(balance.toString())
  ).toFixed(5);

  const resolvedStatus =
    cancelled === "Yes"
      ? "Cancelled"
      : status;
>>>>>>> parent of 52c3490 (Fix: Display all wills including executed ones as transaction history)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="
        bg-[#0B1B34]/60 backdrop-blur-xl
        border border-gold/30 rounded-2xl
        shadow-lg p-6 mb-6
      "
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gold font-serif text-2xl">Will Document</h2>
        <span
          className={`px-3 py-1 rounded-lg text-sm border ${
            statusColors[resolvedStatus]
          }`}
        >
          {resolvedStatus}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-y-3 text-slate-200">
        <div>
          <p className="text-gold font-semibold">Owner</p>
          <TruncatedAddress address={walletAddress} />
        </div>

        <div>
          <p className="text-gold font-semibold">Balance</p>
<<<<<<< HEAD
          <p className="text-white">{balanceEth.toFixed(4)} ETH</p>
          
          {Number(balanceEth) === 0 && Number(totalDepositedEth) > 0 && (
          <p className="text-sm text-slate-300">
            Sent: {Number(totalDepositedEth).toFixed(4)} ETH
          </p>

)}

=======
          <p className="text-white">{formattedBalance} ETH</p>
>>>>>>> parent of 52c3490 (Fix: Display all wills including executed ones as transaction history)
        </div>

        {beneficiaries.length > 0 && (
          <div className="col-span-2 mt-2">
            <p className="text-gold font-semibold mb-1">Distribution</p>
            {beneficiaries.map((addr, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{addr.slice(0, 6)}…{addr.slice(-4)}</span>
                <span className="text-gold">
                  {(amountsEth[i] || 0).toFixed(4)} ETH
                </span>
              </div>
            ))}
          </div>
        )}

        <div>
          <p className="text-gold font-semibold">Time Left</p>
          {timeLeft > 0 ? (
<<<<<<< HEAD
            <CountdownTimer
              lastPing={lastPingTimestamp}
              deathTimeout={deathTimeoutSeconds}
            />
=======
            <CountdownTimer lastPing={lastPing} deathTimeout={deathTimeout} />
>>>>>>> parent of 52c3490 (Fix: Display all wills including executed ones as transaction history)
          ) : (
            <p className="text-red-300">Expired</p>
          )}
        </div>

        <div>
          <p className="text-gold font-semibold">Death Timeout</p>
<<<<<<< HEAD
          <p className="text-white">
            {deathTimeoutSeconds}s ({(deathTimeoutSeconds / 86400).toFixed(1)} days)
          </p>
=======
          <p className="text-white">{deathTimeout} sec</p>
>>>>>>> parent of 52c3490 (Fix: Display all wills including executed ones as transaction history)
        </div>

        <div>
          <p className="text-gold font-semibold">Last Ping</p>
<<<<<<< HEAD
          <p className="text-white">
            {new Date(lastPingTimestamp * 1000).toLocaleString()}
          </p>
=======
          <p className="text-white">{lastPing}</p>
>>>>>>> parent of 52c3490 (Fix: Display all wills including executed ones as transaction history)
        </div>

        <div>
          <p className="text-gold font-semibold">Cancelled</p>
<<<<<<< HEAD
          <p className="text-white">{cancelled ? "Yes" : "No"}</p>
=======
          <p className="text-white">{cancelled}</p>
>>>>>>> parent of 52c3490 (Fix: Display all wills including executed ones as transaction history)
        </div>
      </div>
    </motion.div>
  );
};

export default WillsCard;
