import { useState } from "react";
import PropTypes from "prop-types";
import { useContract } from "../context/ContractContext";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "./DashboardLayout";
import { Trash2, Plus } from "lucide-react";
import TextInput from "./Core/Form/TextInput";
import Button from "./Core/Buttons/Button";
import ButtonText from "./Core/Buttons/ButtonText";

const WillForm = ({ onCreateWill }) => {
  const [step, setStep] = useState(1);

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [amounts, setAmounts] = useState([]);

  const [deathTimeout, setDeathTimeout] = useState("");
  const [etherValue, setEtherValue] = useState("");
  const [loading, setLoading] = useState(false);

  const { contract, walletAddress } = useContract();

  // --------------------------
  // Input Helpers
  // --------------------------
  const handleChange = (setter, i, value) => {
    setter((prev) => {
      const updated = [...prev];
      updated[i] = value.trim(); // ENS-safe
      return updated;
    });
  };

  const addField = () => {
    if (beneficiaries.length < 10) {
      setBeneficiaries((prev) => [...prev, ""]);
      setAmounts((prev) => [...prev, ""]);
    }
  };

  const removeField = (i) => {
    setBeneficiaries((prev) => prev.filter((_, idx) => idx !== i));
    setAmounts((prev) => prev.filter((_, idx) => idx !== i));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  // --------------------------
  // Submit Handler (ENS-safe)
  // --------------------------
  const handleSubmit = async () => {
    if (!contract || !walletAddress) {
      toast.warn("Wallet not connected");
      return;
    }

    const cleanedBeneficiaries = beneficiaries.filter(
      (b) => b && b.trim() !== ""
    );
    const cleanedAmounts = amounts.filter((a) => a && a.trim() !== "");

    if (cleanedBeneficiaries.length === 0) {
      toast.error("Please enter at least one beneficiary.");
      return;
    }

    if (cleanedBeneficiaries.length !== cleanedAmounts.length) {
      toast.error("Each beneficiary must have an associated amount.");
      return;
    }

    // Validate addresses
    for (let i = 0; i < cleanedBeneficiaries.length; i++) {
      if (!ethers.utils.isAddress(cleanedBeneficiaries[i])) {
        toast.error(`Invalid Ethereum address at row ${i + 1}`);
        return;
      }
    }

    // Validate amounts
    for (let i = 0; i < cleanedAmounts.length; i++) {
      if (isNaN(cleanedAmounts[i]) || Number(cleanedAmounts[i]) <= 0) {
        toast.error(`Invalid ETH amount at row ${i + 1}`);
        return;
      }
    }

    // Validate timeout
    if (!deathTimeout || isNaN(deathTimeout) || Number(deathTimeout) <= 0) {
      toast.error("Death timeout must be a valid number.");
      return;
    }

    // Validate funding
    if (!etherValue || isNaN(etherValue) || Number(etherValue) <= 0) {
      toast.error("Total ETH must be a valid positive number.");
      return;
    }

    setLoading(true);

    try {
      const tx = await contract.createWill(
        cleanedBeneficiaries,
        cleanedAmounts.map((amt) => ethers.utils.parseEther(amt)),
        Number(deathTimeout),
        { value: ethers.utils.parseEther(etherValue) }
      );

      await tx.wait();
      toast.success("Will created successfully.");

      onCreateWill?.();

      // reset
      setBeneficiaries([]);
      setAmounts([]);
      setDeathTimeout("");
      setEtherValue("");

    } catch (err) {
      console.error(err);
      toast.error(err?.error?.message || err?.message || "Transaction failed.");
    }

    setLoading(false);
  };

  const stepMotion = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
    transition: { duration: 0.35 },
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto bg-[#0B1B34]/60 backdrop-blur-xl border border-gold/30 shadow-xl p-8 rounded-2xl text-white">

        <h1 className="text-gold font-serif text-3xl mb-6">Create Your Will</h1>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`flex-1 h-2 mx-1 rounded-full ${
                step >= n ? "bg-gold" : "bg-slate/40"
              }`}
            ></div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ------------ STEP 1 ------------ */}
          {step === 1 && (
            <motion.div key="step1" {...stepMotion}>
              <h2 className="text-xl font-semibold mb-4 text-gold">
                1. Beneficiaries & Allocations
              </h2>

              {beneficiaries.map((b, i) => (
                <div key={i} className="flex gap-3 items-center mb-3">
                  <TextInput
                    placeholder="Beneficiary address (0x...)"
                    className="flex-1"
                    value={b}
                    onChange={(e) =>
                      handleChange(setBeneficiaries, i, e.target.value)
                    }
                  />

                  <TextInput
                    type="number"
                    placeholder="ETH"
                    className="w-32"
                    value={amounts[i]}
                    onChange={(e) =>
                      handleChange(setAmounts, i, e.target.value)
                    }
                  />

                  {beneficiaries.length > 1 && (
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-600"
                      onClick={() => removeField(i)}
                    >
                      <Trash2 />
                    </button>
                  )}
                </div>
              ))}

              {beneficiaries.length < 10 && (
                <button
                  type="button"
                  onClick={addField}
                  className="flex items-center gap-2 text-gold mt-2 hover:underline"
                >
                  <Plus size={18} /> Add Beneficiary
                </button>
              )}

              <div className="flex justify-end mt-6">
                <Button onClick={nextStep}>
                  <ButtonText>Next</ButtonText>
                </Button>
              </div>
            </motion.div>
          )}

          {/* ------------ STEP 2 ------------ */}
          {step === 2 && (
            <motion.div key="step2" {...stepMotion}>
              <h2 className="text-xl font-semibold mb-4 text-gold">
                2. Inactivity Timer
              </h2>

              <TextInput
                placeholder="Death Timeout (seconds)"
                value={deathTimeout}
                onChange={(e) => setDeathTimeout(e.target.value)}
                className="w-full"
              />

              <div className="flex justify-between mt-6">
                <Button onClick={prevStep}><ButtonText>Back</ButtonText></Button>
                <Button onClick={nextStep}><ButtonText>Next</ButtonText></Button>
              </div>
            </motion.div>
          )}

          {/* ------------ STEP 3 ------------ */}
          {step === 3 && (
            <motion.div key="step3" {...stepMotion}>
              <h2 className="text-xl font-semibold mb-4 text-gold">
                3. Deposit ETH
              </h2>

              <TextInput
                placeholder="Total ETH to deposit"
                value={etherValue}
                onChange={(e) => setEtherValue(e.target.value)}
                className="w-full"
              />

              <div className="flex justify-between mt-6">
                <Button onClick={prevStep}><ButtonText>Back</ButtonText></Button>
                <Button onClick={nextStep}><ButtonText>Next</ButtonText></Button>
              </div>
            </motion.div>
          )}

          {/* ------------ STEP 4 ------------ */}
          {step === 4 && (
            <motion.div key="step4" {...stepMotion}>
              <h2 className="text-xl font-semibold mb-6 text-gold">
                4. Review & Confirm
              </h2>

              <div className="bg-white/5 p-5 rounded-xl border border-gold/30 space-y-3">
                <h3 className="font-serif text-gold text-lg">Beneficiaries</h3>

                {beneficiaries.map((b, i) =>
                  b?.trim() ? (
                    <p key={i} className="text-slate/80">
                      {b} — <span className="text-white">{amounts[i]} ETH</span>
                    </p>
                  ) : null
                )}

                <h3 className="font-serif text-gold text-lg mt-4">Timeout</h3>
                <p className="text-slate/80">{deathTimeout} seconds</p>

                <h3 className="font-serif text-gold text-lg mt-4">Total Funding</h3>
                <p className="text-slate/80">{etherValue} ETH</p>
              </div>

              <div className="flex justify-between mt-8">
                <Button onClick={prevStep}><ButtonText>Back</ButtonText></Button>

                <Button disabled={loading} loading={loading} onClick={handleSubmit}>
                  <ButtonText>Confirm & Create Will</ButtonText>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

WillForm.propTypes = {
  onCreateWill: PropTypes.func,
};

export default WillForm;
