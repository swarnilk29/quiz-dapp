require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Import dotenv for environment variables

module.exports = {
  solidity: "0.8.27",
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", // Hardhat node
    },
    sepolia: {
      url: process.env.ALCHEMY_API_URL, // Alchemy URL from .env
      accounts:  process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [], // Private key from .env
      gas: "auto", // Automatically estimates gas limit
      gasPrice: "auto", // Automatically fetches the gas price
    },
  },
};

task("balance", "Prints the balance of the deployer account")
  .addParam("address", "The account's address")
  .setAction(async (taskArgs) => {
    const balance = await ethers.provider.getBalance(taskArgs.address);
    console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`);
  });
