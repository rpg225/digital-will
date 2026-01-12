# Digital Will dApp — Frontend Refactor & UX Stabilization

## Overview

This project is a **frontend refactor and UX stabilization** of an existing Ethereum-based **Digital Will decentralized application**.

The original application enables users to create a digital will that distributes ETH to beneficiaries after a defined period of inactivity.  
This fork focuses on improving **usability, visual clarity, wallet reliability, and frontend robustness** — without modifying the original smart contract logic.

The project is considered **feature-complete for frontend improvements** and is suitable for portfolio presentation.

---

## What Was Done

### Frontend & UX Improvements

- Refactored dashboard layout and visual hierarchy
- Introduced a clean **law-firm / notary-inspired UI**
- Added an animated, accessible **Connect Wallet** button using Framer Motion
- Improved sidebar navigation and reusable card components
- Hardened UI rendering against invalid or partial contract state
- Defensive formatting for BigNumber values and timestamps
- Reduced UI crashes caused by undefined or cleared contract data

### Wallet & Web3 Integration

- Stabilized wallet connection logic
- Supported **MetaMask** and **Core Wallet**
- Prevented duplicate `eth_requestAccounts` calls
- Improved network validation and connection feedback
- Reduced common Web3 frontend issues (BigNumber overflow, stale signer, reload loops)

### Code Quality & Reliability

- Normalized smart contract return data
- Improved custom hooks (`useGetWills`) for safer reads
- Clear separation of concerns:
  - Context (wallet & provider)
  - Hooks (contract reads)
  - UI components
- Added defensive guards to prevent runtime crashes

---

## Known Limitation (Intentional)

The **My Will** page may show inconsistent state in edge cases (e.g. cancelled or executed wills).

This is due to **semantic ambiguity in the original smart contract**, where:

- Cancelled or executed wills clear beneficiary data
- The same mapping slot is reused
- Frontend cannot reliably infer lifecycle history without additional contract state

Fixing this correctly would require **smart contract redesign**, which was intentionally **out of scope** for this frontend-focused refactor.

The **Dashboard** reflects aggregate state correctly.  
Deeper lifecycle semantics are deferred by design.

---

## Tech Stack

### Frontend

- **React** (Vite)
- **Tailwind CSS**
- **Framer Motion**
- **React Router**
- **Lucide Icons**

### Web3

- **ethers.js (v5)**
- **MetaMask**
- **Core Wallet**
- **Hardhat** (local development & testing)

### Tooling

- **Vite**
- **ESLint**
- **GitHub Desktop**

---

## Project Status

- ✅ Frontend refactor complete  
- ✅ Wallet integration stabilized  
- ✅ Deployed and demo-ready  
- ❌ Smart contract redesign intentionally out of scope  

---

## Why This Project Matters

This project demonstrates the ability to:

- Refactor and stabilize an existing Web3 codebase
- Improve UX under smart contract constraints
- Debug real-world dApp integration issues
- Balance engineering quality with delivery
- Know when to ship instead of over-engineering

---

## Notes

This repository represents a **frontend-focused contribution** to an existing dApp.  
All smart contract logic remains unchanged from the original implementation.

---
