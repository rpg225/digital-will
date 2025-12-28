import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import UserWill from './UserWill'
import PingWill from './PingWill'
import CancelWill from './CancelWill'
import CreateWillForm from './WillForm'
import { useContract } from '../context/ContractContext'
import DashboardLayout from './DashboardLayout'
import useGetWills from '../hooks/useGetWills'
import { ethers } from 'ethers'

const MyWill = () => {
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState([])

  const { walletAddress, contract } = useContract()
  const { willInfo, hasWill, fetchAllWills } = useGetWills()

  const fetchWillHistory = async () => {
    if (!contract || !walletAddress) return

    try {
      setLoading(true)

      // 🔥 ALL wills ever created by THIS wallet
      const filter = contract.filters.WillCreated(walletAddress)
      const logs = await contract.queryFilter(filter, 0, 'latest')

      const formatted = logs.map((log, index) => ({
        id: `${log.transactionHash}-${index}`,
        blockNumber: log.blockNumber,
        beneficiaries: log.args.beneficiaries,
        amounts: log.args.amounts.map(a =>
          ethers.utils.formatEther(a)
        ),
        balance: ethers.utils.formatEther(log.args.balance),
        deathTimeout: log.args.deathTimeout.toString(),
        txHash: log.transactionHash,
      }))

      setHistory(formatted)

      // refresh global state if needed
      if (fetchAllWills) fetchAllWills()
    } catch (err) {
      const message = err?.error?.message || err?.message || err
      console.error(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWillHistory()
  }, [contract, walletAddress])

  return (
    <div className="min-w-3xl mx-auto">
      {hasWill ? (
        <DashboardLayout>
          {loading ? (
            <div className="text-center text-2xl text-white mt-20">
              Loading Will data...
            </div>
          ) : (
            <>
              {/* CURRENT WILL */}
              <div className="max-w-3xl flex gap-4 items-center mx-auto">
                <UserWill willInfo={willInfo} />
                <div className="flex flex-col justify-center items-center gap-4 w-80">
                  <PingWill onPingComplete={fetchWillHistory} />
                  <CancelWill onCancelComplete={fetchWillHistory} />
                </div>
              </div>

              {/* HISTORY */}
              <div className="mt-10 max-w-3xl mx-auto">
                <h2 className="text-xl text-white mb-4">
                  Will History
                </h2>

                {history.length === 0 ? (
                  <p className="text-gray-400">
                    No previous wills found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {history.map(will => (
                      <div
                        key={will.id}
                        className="border border-gray-700 rounded p-4 text-white"
                      >
                        <div className="text-sm text-gray-400">
                          Block #{will.blockNumber}
                        </div>

                        <div>
                          Balance: {will.balance} ETH
                        </div>

                        <div>
                          Beneficiaries: {will.beneficiaries.length}
                        </div>

                        <div className="text-xs text-gray-500 break-all">
                          TX: {will.txHash}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DashboardLayout>
      ) : (
        <CreateWillForm onCreateWill={fetchWillHistory} />
      )}
    </div>
  )
}

export default MyWill
