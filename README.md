# Decentralized Quiz App
## 📖 Project Overview

Decentralized quiz application using Solidity, Hardhat, Web3.js/ethers.js, and Next.js.

## 🌟 Features

- **Quiz Management**
  - Store quiz questions with the following fields :-
    questionText (string): The question text.
    options (array of strings): The multiple-choice answers.
    correctOption (integer): Index of the correct answer.
  - Track user scores based on their answers.

- **Payment Integration**:
  - Require a fee in **ETH** to join the quiz.
  - Convert the payment from **ETH** to **USDT** 
  - Emit events for:
    - Payment confirmation.
    - Quiz participation and answer submissions.

## 🚀 Technologies

| Category | Technologies |
|----------|--------------|
| Frontend | Next.js |
| Smart Contract | Solidity, Hardhat |
| Network | Ethereum (Sepolia Testnet) |
| Wallet | MetaMask |

Update the contract_address.json file with your deployed contract address
Craete the .env file 
