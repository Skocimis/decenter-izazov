require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
      forking: {
        url: "https://mainnet.infura.io/v3/"+process.env.INFURA_API_KEY
      }
    }
  },
  solidity: "0.8.9"
};
