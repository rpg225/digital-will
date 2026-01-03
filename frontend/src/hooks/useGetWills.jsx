import { useCallback, useEffect, useState } from "react"
import { ethers } from "ethers"
import { useContract } from "../context/ContractContext"

const useGetWills = () => {
  const { contract, walletAddress, isConnected } = useContract()

  const [wills, setWills] = useState([])
  const [activeWill, setActiveWill] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchWills = useCallback(async () => {
    if (!contract || !walletAddress) return

    setLoading(true)

    try {
      // 1️⃣ get all will IDs for this user
      const ids = await contract.getMyWillIds()

      const fetched = []

      for (const id of ids) {
        const will = await contract.getWillById(walletAddress, id)

        fetched.push({
          id: Number(id),
          beneficiaries: will.beneficiaries,
          amounts: will.amounts.map(a =>
            ethers.utils.formatEther(a)
          ),
          balance: ethers.utils.formatEther(will.balance),
          createdAt: Number(will.createdAt),
          lastPing: Number(will.lastPing),
          deathTimeout: Number(will.deathTimeout),
          status: Object.keys(will).includes("status")
            ? Number(will.status)
            : null,
        })
      }

      setWills(fetched)

      // 2️⃣ find active will (status === ACTIVE = 1)
      const active = fetched.find(w => w.status === 1)
      setActiveWill(active ?? null)
    } catch (err) {
      console.error("❌ Failed to fetch wills:", err)
    } finally {
      setLoading(false)
    }
  }, [contract, walletAddress])

  useEffect(() => {
    if (isConnected) fetchWills()
  }, [isConnected, fetchWills])

  return {
    wills,
    activeWill,
    loading,
    refresh: fetchWills,
  }
}

export default useGetWills
