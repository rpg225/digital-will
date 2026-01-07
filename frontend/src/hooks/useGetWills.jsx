<<<<<<< HEAD
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
=======
import React, { useEffect, useState } from 'react'
import { useContract } from '../context/ContractContext'
import { toast } from 'react-toastify'
import { Contract, ethers } from 'ethers'
import { contractAddress } from '../utils/contractAddress'
import contractAbi from '../abi/CreateWill.json'

const ABI = contractAbi.abi;

const useGetWills = () => {
    const [wills, setWills] = useState([])
    const [willInfo, setWillInfo] = useState(null)
    const [hasWill, setHasWill] = useState(false)
    const [totalBalance, setTotalBalance] = useState(0)
    const [willsCreated, setWillsCreated] = useState(0)

    const {contract, provider, walletAddress, isConnected} = useContract()

    const fetchAllWills = async () => {
        if (!contract || !walletAddress) {
            toast.warn("Connect Wallet")
            return;
        }

        try {
            // DEBUG: Check network and contract
            const network = await provider.getNetwork();
            console.log("Connected to network:", network.chainId);
            
            const code = await provider.getCode(contractAddress);
            console.log("Contract exists:", code !== "0x");
            console.log("Contract address:", contractAddress);
            
            const filterInstance = new Contract(contractAddress, ABI, provider)
            const filter = filterInstance.filters.WillCreated()
            const events = await filterInstance.queryFilter(filter, 0, 'latest');

            const parsed = events.map(event => ({
                testator: event.args.testator,
                beneficiaries: event.args.beneficiaries,
                amounts: event.args.amounts.map(a => ethers.utils.formatEther(a)),
                balance: ethers.utils.formatEther(event.args.balance),
                deathTimeout: event.args.deathTimeout.toString(),
                blockNumber: event.blockNumber
            }))

            const totalEther = parsed.reduce((acc, cur) => parseFloat(acc) + parseFloat(cur.balance), 0)

            // Check user's will
            const will = await contract.usersWill(walletAddress)
            const isCreated = will?.balance.gt(0)

            const testators = await contract.getAllTestators()
            const now = Math.floor(Date.now() / 1000)
            const willList = []

            const uniqueTestators = [...new Set(testators)]

            for (const addr of uniqueTestators) {
                try {
                    const wills = await contract.usersWill(addr)
                    
                    // Check if will exists (has balance)
                    if (wills.balance.gt(0)) {
                        const timeLeft = parseInt(wills.lastPing) + parseInt(wills.deathTimeout) - now;

                        willList.push({
                            address: addr,
                            balance: wills.balance,
                            beneficiaries: wills.beneficiaries,
                            amounts: wills.amounts,
                            deathTimeout: wills.deathTimeout,
                            lastPing: wills.lastPing,
                            executed: wills.executed,
                            cancelled: wills.cancelled,
                            timeLeft,
                            isDead: timeLeft <= 0 && !wills.executed && !wills.cancelled
                        })
                    }
                } catch (err) {
                    console.warn(`Failed to fetch will for ${addr}:`, err.message)
                    // Continue to next address
                }
            }

            setWills(willList)
            setHasWill(isCreated)
            setWillInfo(will)
            setTotalBalance(totalEther)
            setWillsCreated(parsed?.length)

        } catch (error) {
            const message = error?.error?.message || error?.message || error;
            console.error("Full error:", error);
            toast.error(message)
        }
    }

    useEffect(() => {
        fetchAllWills()
    }, [contract, isConnected, walletAddress])

  return {fetchAllWills, wills, willsCreated, totalBalance, hasWill, willInfo}
>>>>>>> parent of 52c3490 (Fix: Display all wills including executed ones as transaction history)
}

export default useGetWills