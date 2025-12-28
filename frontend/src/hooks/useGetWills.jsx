import { useEffect, useState, useCallback, useRef } from 'react'
import { useContract } from '../context/ContractContext'
import { toast } from 'react-toastify'
import { Contract, ethers } from 'ethers'
import { contractAddress } from '../utils/contractAddress'
import contractAbi from '../abi/CreateWill.json'

const ABI = contractAbi.abi
const ZERO = ethers.BigNumber.from(0)

// 🔒 HARDENED NORMALIZER (FINAL FORM)
const normalizeWill = (w) => {
  const beneficiaries = Array.isArray(w?.[0]) ? w[0] : []
  const rawAmounts = w?.[1]

  const amounts = Array.isArray(rawAmounts)
    ? rawAmounts
    : rawAmounts
    ? [rawAmounts]
    : []

  return {
    beneficiaries,
    amounts,
    executed: Boolean(w?.[2]),
    lastPing: Number(w?.[3] ?? 0),
    cancelled: Boolean(w?.[4]),
    balance: ethers.BigNumber.isBigNumber(w?.[5]) ? w[5] : ZERO,
    deathTimeout: Number(w?.[6] ?? 0),
  }
}

const useGetWills = () => {
  const [wills, setWills] = useState([])
  const [willInfo, setWillInfo] = useState(null)
  const [hasWill, setHasWill] = useState(false)
  const [totalBalance, setTotalBalance] = useState(0)
  const [willsCreated, setWillsCreated] = useState(0)
  const [loading, setLoading] = useState(false)

  const { contract, provider, walletAddress, isConnected } = useContract()
  const isFetching = useRef(false)

  const fetchAllWills = useCallback(async () => {
    if (!contract || !provider || !walletAddress || isFetching.current) return
    isFetching.current = true
    setLoading(true)

    try {
      /* ---------- EVENTS ---------- */
      const filterInstance = new Contract(contractAddress, ABI, provider)
      const events = await filterInstance.queryFilter(
        filterInstance.filters.WillCreated(),
        0,
        'latest'
      )

      setWillsCreated(events.length)

      setTotalBalance(
        events.reduce(
          (acc, e) =>
            acc + parseFloat(ethers.utils.formatEther(e.args.balance)),
          0
        )
      )

      /* ---------- USER WILL ---------- */
      const userRaw = await contract.usersWill(walletAddress)
      const userWill = normalizeWill(userRaw)

      setHasWill(
        userWill.balance.gt(0) &&
        !userWill.executed &&
        !userWill.cancelled
      )
      setWillInfo(userWill)

      /* ---------- ALL WILLS ---------- */
      const testators = await contract.getAllTestators()
      const uniqueTestators = [...new Set(testators)]
      const now = Math.floor(Date.now() / 1000)

      const willList = []

      for (const addr of uniqueTestators) {
        try {
          const raw = await contract.usersWill(addr)
          const will = normalizeWill(raw)

          const timeLeft =
            will.lastPing + will.deathTimeout - now

          willList.push({
            address: addr,
            balanceEth: ethers.utils.formatEther(will.balance),
            beneficiaries: will.beneficiaries,
            amounts: will.amounts.map((a) =>
              ethers.utils.formatEther(a)
            ),
            executed: will.executed,
            cancelled: will.cancelled,
            lastPing: will.lastPing,
            deathTimeout: will.deathTimeout,
            timeLeft,
            status: will.executed
              ? 'EXECUTED'
              : will.cancelled
              ? 'CANCELLED'
              : will.balance.gt(0)
              ? 'ACTIVE'
              : 'EMPTY',
          })
        } catch (e) {
          console.error('Skipping broken will:', addr, e)
        }
      }

      setWills(willList)
      console.log('✅ Wills loaded:', willList.length)
    } catch (err) {
      console.error('❌ Fetch error:', err)
      toast.error('Failed to load wills')
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [contract, provider, walletAddress])

  useEffect(() => {
    if (isConnected) fetchAllWills()
  }, [isConnected, fetchAllWills])

  return {
    fetchAllWills,
    wills,
    willsCreated,
    totalBalance,
    hasWill,
    willInfo,
    loading,
  }
}

export default useGetWills
