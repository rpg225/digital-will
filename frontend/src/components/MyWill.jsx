import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { ethers } from "ethers";

import UserWill from "./UserWill";
import PingWill from "./PingWill";
import CancelWill from "./CancelWill";
import DashboardLayout from "./DashboardLayout";

import { useContract } from "../context/ContractContext";
import useGetWills from "../hooks/useGetWills";

const MyWill = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  const { walletAddress, contract } = useContract();
  const { willInfo, hasActiveWill, hasEverCreatedWill, fetchAllWills } = useGetWills();

  const fetchWillHistory = async () => {
    if (!contract || !walletAddress) return;

    try {
      setLoading(true);

      // All wills created by THIS wallet (events history)
      const filter = contract.filters.WillCreated(walletAddress);
      const logs = await contract.queryFilter(filter, 0, "latest");

      const formatted = logs.map((log, index) => ({
        id: `${log.transactionHash}-${index}`,
        blockNumber: log.blockNumber,
        beneficiaries: log.args.beneficiaries,
        amounts: log.args.amounts.map((a) => ethers.utils.formatEther(a)),
        balance: ethers.utils.formatEther(log.args.balance),
        deathTimeout: log.args.deathTimeout.toString(),
        txHash: log.transactionHash,
      }));

      setHistory(formatted);

      // refresh global state
      if (fetchAllWills) fetchAllWills();
    } catch (err) {
      const message = err?.error?.message || err?.message || err;
      console.error(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWillHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, walletAddress]);

  return (
    <DashboardLayout>
      {loading ? (
        <div className="text-center text-2xl text-white mt-20">Loading Will data...</div>
      ) : (
        <>
          {/* TOP SECTION: Active vs Not Active */}
          {hasActiveWill ? (
            <div className="max-w-3xl flex gap-4 items-center mx-auto">
              <UserWill willInfo={willInfo} />
              <div className="flex flex-col justify-center items-center gap-4 w-80">
                <PingWill onPingComplete={fetchWillHistory} />
                <CancelWill onCancelComplete={fetchWillHistory} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center mt-12 text-white">
              <h2 className="text-2xl mb-2">No Active Will</h2>
              <p className="text-gray-400 mb-6 text-center max-w-xl">
                {hasEverCreatedWill
                  ? "Your previous will was cancelled or executed. You can create a new one anytime."
                  : "You haven’t created a digital will yet."}
              </p>

              <Link
                to="/create"
                className="px-6 py-3 rounded-xl bg-gold text-navy font-semibold tracking-wide hover:scale-105 transition cursor-pointer"
              >
                Create Your Will
              </Link>
            </div>
          )}

          {/* HISTORY SECTION (show if any) */}
          <div className="mt-10 max-w-3xl mx-auto">
            <h2 className="text-xl text-white mb-4">Will History</h2>

            {history.length === 0 ? (
              <p className="text-gray-400">No previous wills found.</p>
            ) : (
              <div className="space-y-4">
                {history.map((w) => (
                  <div key={w.id} className="border border-gray-700 rounded p-4 text-white">
                    <div className="text-sm text-gray-400">Block #{w.blockNumber}</div>
                    <div>Balance: {w.balance} ETH</div>
                    <div>Beneficiaries: {w.beneficiaries.length}</div>
                    <div className="text-xs text-gray-500 break-all">TX: {w.txHash}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default MyWill;
