require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("hardhat-contract-sizer");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-storage-layout");
require("dotenv").config();

// Environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";
const REPORT_GAS = process.env.REPORT_GAS === "true";

// Base network configuration
const BASE_RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";
const BASE_GOERLI_RPC_URL = process.env.BASE_GOERLI_RPC_URL || "https://goerli.base.org";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
    ],
  },
  
  networks: {
    hardhat: {
      chainId: 31337,
      gas: 12000000,
      blockGasLimit: 12000000,
      allowUnlimitedContractSize: true,
      timeout: 1800000,
      forking: {
        url: BASE_RPC_URL,
        blockNumber: undefined, // Latest block
      },
    },
    
    localhost: {
      chainId: 31337,
      gas: 12000000,
      blockGasLimit: 12000000,
      allowUnlimitedContractSize: true,
      timeout: 1800000,
    },
    
    // Base Mainnet
    base: {
      chainId: 8453,
      url: BASE_RPC_URL,
      accounts: [PRIVATE_KEY],
      gas: 2000000,
      gasPrice: 1000000000, // 1 gwei
      timeout: 120000,
      confirmations: 2,
    },
    
    // Base Goerli Testnet
    baseGoerli: {
      chainId: 84531,
      url: BASE_GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      gas: 2000000,
      gasPrice: 1000000000, // 1 gwei
      timeout: 120000,
      confirmations: 1,
    },
    
    // Ethereum Mainnet (for reference)
    ethereum: {
      chainId: 1,
      url: process.env.ETHEREUM_RPC_URL || "https://mainnet.infura.io/v3/YOUR-PROJECT-ID",
      accounts: [PRIVATE_KEY],
      gas: 2000000,
      gasPrice: 20000000000, // 20 gwei
      timeout: 120000,
      confirmations: 2,
    },
    
    // Polygon (for cross-chain testing)
    polygon: {
      chainId: 137,
      url: process.env.POLYGON_RPC_URL || "https://polygon-mainnet.infura.io/v3/YOUR-PROJECT-ID",
      accounts: [PRIVATE_KEY],
      gas: 2000000,
      gasPrice: 30000000000, // 30 gwei
      timeout: 120000,
      confirmations: 2,
    },
  },
  
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      goerli: ETHERSCAN_API_KEY,
      base: BASESCAN_API_KEY,
      baseGoerli: BASESCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org/"
        }
      },
      {
        network: "baseGoerli",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org/"
        }
      }
    ]
  },
  
  gasReporter: {
    enabled: REPORT_GAS,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    gasPrice: 20,
    token: "ETH",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    showTimeSpent: true,
    showMethodSig: true,
    maxMethodDiff: 10,
  },
  
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: [
      "BitForgeWorkshop",
      "ForgeToken",
      "VirtualsIntegration",
      "AlloyScriptEngine",
      "QuantitativeSmithsGuild",
    ],
  },
  
  namedAccounts: {
    deployer: {
      default: 0,
    },
    feeCollector: {
      default: 1,
    },
    user1: {
      default: 2,
    },
    user2: {
      default: 3,
    },
  },
  
  mocha: {
    timeout: 300000, // 5 minutes
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deploy: "./deploy",
  },
  
  // Storage layout settings
  storageLayout: {
    contracts: [
      "BitForgeWorkshop",
      "ForgeToken",
      "VirtualsIntegration",
      "AlloyScriptEngine",
    ],
    flat: true,
  },
  
  // Docgen settings
  docgen: {
    path: "./docs",
    clear: true,
    runOnCompile: false,
    except: [
      "test/**/*",
      "interfaces/**/*",
      "mocks/**/*",
    ],
  },
  
  // TypeChain settings
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v5",
    alwaysGenerateOverloads: false,
    discriminateTypes: true,
  },
  
  // Coverage settings
  coverage: {
    skipFiles: [
      "test/**/*",
      "interfaces/**/*",
      "mocks/**/*",
    ],
  },
  
  // Custom tasks
  task: {
    // Custom deployment task
    "deploy-all": {
      description: "Deploy all BitForge Workshop contracts",
      action: async (taskArgs, hre) => {
        await hre.run("run", { script: "scripts/deployment/deploy.js" });
      },
    },
    
    // Custom verification task
    "verify-all": {
      description: "Verify all deployed contracts",
      action: async (taskArgs, hre) => {
        await hre.run("run", { script: "scripts/verification/verify-all.js" });
      },
    },
  },
  
  // Deployment configuration
  external: {
    contracts: [
      {
        artifacts: "node_modules/@openzeppelin/contracts/build/contracts",
        deploy: "node_modules/@openzeppelin/contracts/contracts",
      },
    ],
  },
  
  // Custom compiler settings for specific contracts
  overrides: {
    "contracts/core/BitForgeWorkshop.sol": {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 100, // Lower runs for complex contract
        },
        viaIR: true,
      },
    },
    "contracts/tools/AlloyScriptEngine.sol": {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 300, // Higher runs for frequently called contract
        },
        viaIR: true,
      },
    },
  },
  
  // Defender settings (for production monitoring)
  defender: {
    apiKey: process.env.DEFENDER_API_KEY || "",
    apiSecret: process.env.DEFENDER_API_SECRET || "",
  },
  
  // Tenderly settings (for debugging)
  tenderly: {
    project: process.env.TENDERLY_PROJECT || "bitforge-workshop",
    username: process.env.TENDERLY_USERNAME || "",
    privateVerification: true,
  },
}; 