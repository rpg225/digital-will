import { useState } from 'react'
import { useContract } from '../context/ContractContext'
import { ethers } from 'ethers'
import { toast } from 'react-toastify'
import DashboardLayout from './DashboardLayout'
import Button from './Core/Buttons/Button'
import ButtonText from './Core/Buttons/ButtonText'
import TextInput from './Core/Form/TextInput'
import { motion } from 'framer-motion'
import { Skull, AlertCircle, CheckCircle } from 'lucide-react'

const ExecuteWill = () => {
    const [testatorAddress, setTestatorAddress] = useState('')
    const [loading, setLoading] = useState(false)
    const [willStatus, setWillStatus] = useState(null)

    const { contract } = useContract()

    // Check if will is ready to execute
    const checkWillStatus = async () => {
        if (!contract || !testatorAddress) return;
        
        if (!ethers.utils.isAddress(testatorAddress)) {
            toast.error('Invalid Ethereum address')
            return;
        }

        try {
            const will = await contract.usersWill(testatorAddress)
            const now = Math.floor(Date.now() / 1000)
            const timeLeft = parseInt(will.lastPing) + parseInt(will.deathTimeout) - now

            setWillStatus({
                exists: will.balance.gt(0),
                balance: ethers.utils.formatEther(will.balance),
                executed: will.executed,
                cancelled: will.cancelled,
                timeLeft,
                canExecute: timeLeft <= 0 && !will.executed && !will.cancelled && will.balance.gt(0)
            })
        } catch (error) {
            console.error(error)
            toast.error('Failed to fetch will status')
        }
    }

    const handleExecute = async () => {
        if (!contract) {
            toast.warn('Wallet not connected.')
            return;
        }
        
        if (!ethers.utils.isAddress(testatorAddress)) {
            toast.error('Invalid Ethereum address')
            return;
        }

        setLoading(true)
        try {
            const tx = await contract.executeWill(testatorAddress)
            await tx.wait()
            toast.success('Will executed successfully! Funds distributed to beneficiaries.')
            
            // Clear form and status
            setTestatorAddress('')
            setWillStatus(null)
        } catch (error) {
            const message = error?.error?.data?.message || error?.error?.message || error?.message || 'Execution failed';
            console.error(error)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-serif text-gold tracking-wide flex items-center gap-3">
                    <Skull className="w-10 h-10" />
                    Execute Will
                </h1>
                <p className="text-slate/80 mt-2 text-lg">
                    Execute a deceased testator's will and distribute their assets to beneficiaries.
                </p>
            </div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl mx-auto"
            >
                <div className="bg-[#0B1B34]/60 backdrop-blur-xl border border-gold/30 shadow-xl p-8 rounded-2xl">
                    
                    <h2 className="text-gold font-serif text-2xl mb-6">
                        Testator Information
                    </h2>

                    {/* Address Input */}
                    <div className="mb-6">
                        <label className="block text-gold font-semibold mb-2">
                            Testator's Ethereum Address
                        </label>
                        <TextInput
                            type="text"
                            placeholder="0x..."
                            className="w-full"
                            value={testatorAddress}
                            onChange={e => setTestatorAddress(e.target.value)}
                        />
                        <p className="text-slate/60 text-sm mt-2">
                            Enter the address of the deceased testator whose will you want to execute.
                        </p>
                    </div>

                    {/* Check Status Button */}
                    <Button
                        className="w-full mb-6 bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/40"
                        onClick={checkWillStatus}
                        disabled={!testatorAddress || loading}
                    >
                        <ButtonText>Check Will Status</ButtonText>
                    </Button>

                    {/* Will Status Display */}
                    {willStatus && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-6 rounded-xl border mb-6 ${
                                willStatus.canExecute
                                    ? 'bg-green-600/10 border-green-500/40'
                                    : willStatus.exists && !willStatus.executed && !willStatus.cancelled
                                    ? 'bg-yellow-600/10 border-yellow-500/40'
                                    : 'bg-red-600/10 border-red-500/40'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                {willStatus.canExecute ? (
                                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                                ) : (
                                    <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                                )}
                                
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold text-lg mb-3">
                                        {willStatus.canExecute
                                            ? '✓ Will Ready for Execution'
                                            : willStatus.exists && !willStatus.executed && !willStatus.cancelled
                                            ? '⏳ Will Not Yet Executable'
                                            : '✗ Will Cannot Be Executed'}
                                    </h3>

                                    <div className="space-y-2 text-slate-200">
                                        <p><span className="text-gold">Balance:</span> {willStatus.balance} ETH</p>
                                        
                                        {willStatus.executed && (
                                            <p className="text-red-300">⚠️ This will has already been executed</p>
                                        )}
                                        
                                        {willStatus.cancelled && (
                                            <p className="text-red-300">⚠️ This will has been cancelled</p>
                                        )}
                                        
                                        {!willStatus.exists && (
                                            <p className="text-red-300">⚠️ No will exists for this address</p>
                                        )}
                                        
                                        {willStatus.timeLeft > 0 && !willStatus.executed && !willStatus.cancelled && (
                                            <p className="text-yellow-300">
                                                ⏰ Time remaining: {Math.floor(willStatus.timeLeft / 86400)} days, {Math.floor((willStatus.timeLeft % 86400) / 3600)} hours
                                            </p>
                                        )}
                                        
                                        {willStatus.canExecute && (
                                            <p className="text-green-300 font-semibold mt-3">
                                                ✓ The death timeout has expired. You can now execute this will.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Execute Button */}
                    <Button
                        className="w-full bg-red-600/20 hover:bg-red-600/30 border-red-500/40"
                        disabled={loading || (willStatus && !willStatus.canExecute)}
                        loading={loading}
                        onClick={handleExecute}
                    >
                        <ButtonText>
                            {loading ? 'Executing...' : 'Execute Will & Distribute Assets'}
                        </ButtonText>
                    </Button>

                    {/* Warning Notice */}
                    <div className="mt-6 p-4 bg-yellow-600/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-yellow-200 text-sm">
                            <strong>⚠️ Important:</strong> Anyone can execute a will once the death timeout has expired. 
                            This action is irreversible and will immediately distribute all assets to the designated beneficiaries.
                        </p>
                    </div>
                </div>
            </motion.div>
        </DashboardLayout>
    )
}

export default ExecuteWill