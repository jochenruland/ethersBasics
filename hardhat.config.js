require("@nomicfoundation/hardhat-toolbox");

const fs = require('fs');
const infuraKey = fs.readFileSync(".secret").toString().trim();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
      forking: {
        url: `https://mainnet.infura.io/v3/${infuraKey}`,
        //url: `https://polygon-mainnet.infura.io/v3/${infuraKey}`,
      }
    },
  },  
  // Set default mocha options here, use special reporters etc.
  mocha: {
    timeout: 100000
  },
  // Configure your compilers
  solidity: {
    version: "0.8.17"
  }
};
