import { useState } from "react"
import { useContract } from "../context/ContractContext"
import { ethers } from "ethers"
import { toast } from "react-toastify"
import DashboardLayout from "./DashboardLayout"
import Button from "./Core/Buttons/Button"
import ButtonText from "./Core/Buttons/ButtonText"
import TextInput from "./Core/Form/TextInput"
import { motion } from "framer-motion"
import { Skull } from "lucide-react"

const ExecuteWill = () => {
  const [testatorAddress, setTestatorAddress] = useState("")
  const [loading, setLoading] = useState(false)

  const { contract } = useContract()

  const handleExecute = async () => {
    if (!contract) {
      toast.error("Wallet not connected")
      return
    }

    if (!ethers.utils.isAddress(testatorAddress)) {
      toast.error("Invalid Ethereum address")
      return
    }

    setLoading(true)
    try {
      const tx = await contract.executeWill(testatorAddress)
      await tx.wait()

      toast.success("Will executed successfully. Funds distributed.")
      setTestatorAddress("")
    } catch (error) {
      const message =
        error?.error?.data?.message ||
        error?.error?.message ||
        error?.message ||
        "Execution failed"

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
        <h1 className="text-4xl font-serif text-gold flex items-center gap-3">
          <Skull className="w-10 h-10" />
          Execute Will
        </h1>
        <p className="text-slate/80 mt-2 text-lg">
          Execute a will once the death timeout has expired.
        </p>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-[#0B1B34]/60 border border-gold/30 p-8 rounded-2xl">
          <label className="block text-gold font-semibold mb-2">
            Testator Ethereum Address
          </label>

          <TextInput
            type="text"
            placeholder="0x..."
            value={testatorAddress}
            onChange={e => setTestatorAddress(e.target.value)}
            className="w-full mb-6"
          />

          <Button
            className="w-full bg-red-600/20 hover:bg-red-600/30 border-red-500/40"
            loading={loading}
            onClick={handleExecute}
          >
            <ButtonText>
              {loading ? "Executing..." : "Execute Will"}
            </ButtonText>
          </Button>

          <div className="mt-6 p-4 bg-yellow-600/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-200 text-sm">
              <strong>⚠️ Important:</strong> Anyone can execute a will after the
              death timeout expires. This action is irreversible.
            </p>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

export default ExecuteWill
