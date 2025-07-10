const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Deployment configuration
const DEPLOYMENT_CONFIG = {
  network: "base",
  genesis: true, // Genesis launch configuration
  agents: {
    totalCount: 5,
    virtualPerAgent: ethers.utils.parseEther("1000"), // 1000 VIRTUAL per agent
    totalVirtualRequired: ethers.utils.parseEther("5000")
  },
  contracts: {
    // Base network addresses (these would be the actual addresses on Base)
    VIRTUAL_TOKEN: "0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b", // Placeholder - update with actual
    WETH: "0x4200000000000000000000000000000000000006", // Base WETH
    UNISWAP_V3_FACTORY: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD", // Base Uniswap V3
    UNISWAP_V3_ROUTER: "0x2626664c2603336E57B271c5C0b26F421741e481" // Base Uniswap V3 Router
  },
  forge: {
    initialSupply: ethers.utils.parseEther("1000000000"), // 1B tokens
    feeCollector: "", // Will be set to deployer initially
    burnRate: 100, // 1% burn rate
    transferFee: 50 // 0.5% transfer fee
  },
  agents: [
    {
      name: "Quantus the Forge Master",
      ticker: "QUANTUS",
      guild: 0, // QUANTITATIVE_SMITHS
      personality: "Precise, methodical blacksmith obsessed with data patterns like reading metal grain. Views market inefficiencies as impurities to be refined.",
      capabilities: [
        "Statistical Arbitrage",
        "Real-time Market Analysis", 
        "Backtesting Framework",
        "Risk-adjusted Optimization",
        "Pattern Recognition"
      ],
      description: "Master of algorithmic trading and quantitative analysis"
    },
    {
      name: "Aegis the Shield Forger",
      ticker: "AEGIS",
      guild: 1, // RISK_FORGERS
      personality: "Cautious and methodical, like tempering steel. Speaks of risks as stress points in the metal. Focused on protection and preservation.",
      capabilities: [
        "Portfolio Risk Assessment",
        "Hedging Strategy Automation",
        "Stop-loss Optimization",
        "Correlation Analysis",
        "Stress Testing"
      ],
      description: "Guardian of risk management and portfolio protection"
    },
    {
      name: "Fluxa the Flow Shaper",
      ticker: "FLUXA",
      guild: 2, // MARKET_MAKERS
      personality: "Speaks of markets as rivers of molten metal. Focused on smooth flows and efficient distribution. Views spreads as gaps that need filling.",
      capabilities: [
        "Automated Market Making",
        "Liquidity Pool Optimization",
        "Spread Management",
        "Inventory Risk Control",
        "Cross-exchange Arbitrage"
      ],
      description: "Master of liquidity provision and market making"
    },
    {
      name: "Nexus the Asset Shaper",
      ticker: "NEXUS",
      guild: 3, // ALTERNATIVE_CRAFTERS
      personality: "Innovative and experimental, like creating new alloys. Speaks of DeFi as the new metallurgy. Always seeking novel combinations.",
      capabilities: [
        "Yield Farming Optimization",
        "DeFi Protocol Integration",
        "NFT Trading Strategies",
        "Cross-chain Management",
        "Synthetic Asset Creation"
      ],
      description: "Pioneer of DeFi and alternative asset strategies"
    },
    {
      name: "Damascus the Grand Artificer",
      ticker: "DAMASCUS",
      guild: 4, // DAMASCUS_CIRCLE
      personality: "Master of all trades, speaks with deep wisdom. Views complex strategies as Damascus steel patterns. Integrates all guild knowledge.",
      capabilities: [
        "Multi-strategy Management",
        "Cross-guild Integration",
        "Advanced Optimization",
        "Institutional Solutions",
        "Research Leadership"
      ],
      description: "Grand master of advanced multi-strategy implementations"
    }
  ]
};

// Deployment state tracking
let deploymentState = {
  network: "",
  timestamp: 0,
  deployer: "",
  contracts: {},
  agents: {},
  gasUsed: 0,
  totalCost: 0
};

async function main() {
  console.log("🔨 BitForge Workshop Deployment Starting...");
  console.log("========================================");
  
  // Setup deployment
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  deploymentState.network = network.name;
  deploymentState.timestamp = Date.now();
  deploymentState.deployer = deployer.address;
  
  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
  console.log("");
  
  // Check prerequisites
  await checkPrerequisites(deployer);
  
  try {
    // Phase 1: Deploy core contracts
    console.log("⚔️  Phase 1: Deploying Core Contracts");
    console.log("------------------------------------");
    await deployCore(deployer);
    
    // Phase 2: Deploy tool engine
    console.log("🔧 Phase 2: Deploying Tool Engine");
    console.log("----------------------------------");
    await deployToolEngine(deployer);
    
    // Phase 3: Deploy guild contracts
    console.log("🏰 Phase 3: Deploying Guild Contracts");
    console.log("-------------------------------------");
    await deployGuilds(deployer);
    
    // Phase 4: Deploy Virtuals integration
    console.log("🌐 Phase 4: Deploying Virtuals Integration");
    console.log("------------------------------------------");
    await deployVirtualsIntegration(deployer);
    
    // Phase 5: Initialize contracts
    console.log("⚡ Phase 5: Initializing Contracts");
    console.log("----------------------------------");
    await initializeContracts(deployer);
    
    // Phase 6: Prepare agent deployments
    console.log("🤖 Phase 6: Preparing Agent Deployments");
    console.log("---------------------------------------");
    await prepareAgentDeployments(deployer);
    
    // Phase 7: Generate deployment artifacts
    console.log("📜 Phase 7: Generating Deployment Artifacts");
    console.log("-------------------------------------------");
    await generateDeploymentArtifacts();
    
    console.log("");
    console.log("✅ BitForge Workshop Deployment Complete!");
    console.log("=========================================");
    console.log(`Total Gas Used: ${deploymentState.gasUsed.toLocaleString()}`);
    console.log(`Total Cost: ${ethers.utils.formatEther(deploymentState.totalCost)} ETH`);
    console.log("");
    console.log("🚀 Next Steps:");
    console.log("1. Fund contracts with initial liquidity");
    console.log("2. Deploy agents to Virtuals Protocol");
    console.log("3. Configure agent personalities and capabilities");
    console.log("4. Begin revenue generation activities");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

async function checkPrerequisites(deployer) {
  console.log("🔍 Checking Prerequisites...");
  
  // Check balance
  const balance = await deployer.getBalance();
  const minBalance = ethers.utils.parseEther("1.0"); // 1 ETH minimum
  
  if (balance.lt(minBalance)) {
    throw new Error(`Insufficient balance. Need at least 1 ETH, have ${ethers.utils.formatEther(balance)} ETH`);
  }
  
  // Check network
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 8453) { // Base mainnet
    console.log("⚠️  Warning: Not deploying to Base mainnet");
  }
  
  console.log("✅ Prerequisites check passed");
  console.log("");
}

async function deployCore(deployer) {
  // Deploy FORGE token
  console.log("Deploying FORGE Token...");
  const ForgeToken = await ethers.getContractFactory("ForgeToken");
  const forgeToken = await ForgeToken.deploy(deployer.address);
  await forgeToken.deployed();
  
  deploymentState.contracts.forgeToken = forgeToken.address;
  await trackDeployment(forgeToken.deployTransaction);
  
  console.log(`✅ FORGE Token deployed: ${forgeToken.address}`);
  
  // Deploy BitForge Workshop
  console.log("Deploying BitForge Workshop...");
  const BitForgeWorkshop = await ethers.getContractFactory("BitForgeWorkshop");
  const workshop = await BitForgeWorkshop.deploy(
    DEPLOYMENT_CONFIG.contracts.VIRTUAL_TOKEN,
    forgeToken.address
  );
  await workshop.deployed();
  
  deploymentState.contracts.workshop = workshop.address;
  await trackDeployment(workshop.deployTransaction);
  
  console.log(`✅ BitForge Workshop deployed: ${workshop.address}`);
  
  // Configure FORGE token with workshop
  console.log("Configuring FORGE token...");
  await forgeToken.setWorkshopContract(workshop.address);
  console.log("✅ FORGE token configured");
  
  console.log("");
}

async function deployToolEngine(deployer) {
  console.log("Deploying AlloyScript Engine...");
  const AlloyScriptEngine = await ethers.getContractFactory("AlloyScriptEngine");
  const scriptEngine = await AlloyScriptEngine.deploy(deploymentState.contracts.workshop);
  await scriptEngine.deployed();
  
  deploymentState.contracts.scriptEngine = scriptEngine.address;
  await trackDeployment(scriptEngine.deployTransaction);
  
  console.log(`✅ AlloyScript Engine deployed: ${scriptEngine.address}`);
  console.log("");
}

async function deployGuilds(deployer) {
  console.log("Deploying Quantitative Smiths Guild...");
  const QuantitativeSmithsGuild = await ethers.getContractFactory("QuantitativeSmithsGuild");
  const quantGuild = await QuantitativeSmithsGuild.deploy(
    deploymentState.contracts.workshop,
    deploymentState.contracts.scriptEngine,
    deploymentState.contracts.workshop, // Placeholder for price oracle
    deploymentState.contracts.workshop  // Placeholder for trading engine
  );
  await quantGuild.deployed();
  
  deploymentState.contracts.quantitativeGuild = quantGuild.address;
  await trackDeployment(quantGuild.deployTransaction);
  
  console.log(`✅ Quantitative Smiths Guild deployed: ${quantGuild.address}`);
  console.log("");
}

async function deployVirtualsIntegration(deployer) {
  console.log("Deploying Virtuals Integration with ACP and G.A.M.E. support...");
  
  // Deploy ACP Registry
  console.log("  📋 Deploying ACP Registry...");
  const ACPRegistry = await ethers.getContractFactory("ACPRegistry");
  const acpRegistry = await ACPRegistry.deploy();
  await acpRegistry.deployed();
  await trackDeployment(acpRegistry.deployTransaction);
  
  deploymentState.contracts.acpRegistry = acpRegistry.address;
  console.log(`  ✅ ACPRegistry deployed: ${acpRegistry.address}`);
  
  // Deploy ACP Escrow
  console.log("  🏦 Deploying ACP Escrow...");
  const ACPEscrow = await ethers.getContractFactory("ACPEscrow");
  const acpEscrow = await ACPEscrow.deploy(deployer.address); // Fee recipient
  await acpEscrow.deployed();
  await trackDeployment(acpEscrow.deployTransaction);
  
  deploymentState.contracts.acpEscrow = acpEscrow.address;
  console.log(`  ✅ ACPEscrow deployed: ${acpEscrow.address}`);
  
  // Deploy G.A.M.E. Engine
  console.log("  🎮 Deploying G.A.M.E. Engine...");
  const GameEngine = await ethers.getContractFactory("GameEngine");
  const gameEngine = await GameEngine.deploy();
  await gameEngine.deployed();
  await trackDeployment(gameEngine.deployTransaction);
  
  deploymentState.contracts.gameEngine = gameEngine.address;
  console.log(`  ✅ GameEngine deployed: ${gameEngine.address}`);
  
  // Deploy VirtualsIntegration contract with ACP and G.A.M.E. support
  console.log("  🌐 Deploying Enhanced Virtuals Integration...");
  const VirtualsIntegration = await ethers.getContractFactory("VirtualsIntegration");
  const virtualsIntegration = await VirtualsIntegration.deploy(
    deploymentState.contracts.workshop,
    DEPLOYMENT_CONFIG.contracts.VIRTUAL_TOKEN,
    deploymentState.contracts.workshop, // Placeholder for Virtuals Factory
    acpRegistry.address,
    acpEscrow.address,
    gameEngine.address
  );
  await virtualsIntegration.deployed();
  await trackDeployment(virtualsIntegration.deployTransaction);
  
  deploymentState.contracts.virtualsIntegration = virtualsIntegration.address;
  console.log(`  ✅ VirtualsIntegration deployed: ${virtualsIntegration.address}`);
  
  // Authorize VirtualsIntegration to use ACP Escrow
  console.log("  🔐 Authorizing contract integrations...");
  const authTx = await acpEscrow.setAuthorizedCaller(virtualsIntegration.address, true);
  await authTx.wait();
  console.log(`  ✅ VirtualsIntegration authorized for ACP Escrow`);
  
  console.log("");
}

async function initializeContracts(deployer) {
  const workshop = await ethers.getContractAt("BitForgeWorkshop", deploymentState.contracts.workshop);
  const scriptEngine = await ethers.getContractAt("AlloyScriptEngine", deploymentState.contracts.scriptEngine);
  
  console.log("Adding initial verifiers...");
  await scriptEngine.addVerifier(deployer.address);
  console.log("✅ Initial verifiers added");
  
  console.log("");
}

async function prepareAgentDeployments(deployer) {
  const workshop = await ethers.getContractAt("BitForgeWorkshop", deploymentState.contracts.workshop);
  
  console.log("Preparing agent deployments...");
  
  for (let i = 0; i < DEPLOYMENT_CONFIG.agents.length; i++) {
    const agent = DEPLOYMENT_CONFIG.agents[i];
    console.log(`Preparing ${agent.name} (${agent.ticker})...`);
    
    // Deploy agent to workshop (this prepares it for Virtuals deployment)
    const tx = await workshop.deployAgent(
      agent.name,
      agent.ticker,
      agent.guild,
      DEPLOYMENT_CONFIG.agents.virtualPerAgent
    );
    
    const receipt = await tx.wait();
    const agentDeployedEvent = receipt.events.find(e => e.event === "AgentDeployed");
    const agentId = agentDeployedEvent.args.agentId;
    
    deploymentState.agents[agent.ticker] = {
      id: agentId.toString(),
      name: agent.name,
      ticker: agent.ticker,
      guild: agent.guild,
      personality: agent.personality,
      capabilities: agent.capabilities,
      description: agent.description,
      readyForVirtuals: true
    };
    
    await trackDeployment(tx);
    console.log(`✅ ${agent.name} prepared (ID: ${agentId})`);
  }
  
  console.log("");
}

async function generateDeploymentArtifacts() {
  console.log("Generating deployment artifacts...");
  
  // Create deployment directory
  const deploymentDir = path.join(__dirname, "../../deployments", deploymentState.network);
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  // Generate comprehensive deployment file
  const deploymentData = {
    ...deploymentState,
    config: DEPLOYMENT_CONFIG,
    deploymentComplete: true,
    readyForVirtuals: true
  };
  
  fs.writeFileSync(
    path.join(deploymentDir, "deployment.json"),
    JSON.stringify(deploymentData, null, 2)
  );
  
  // Generate agent configuration for Virtuals deployment with ACP and G.A.M.E. support
  const agentConfigs = DEPLOYMENT_CONFIG.agents.map((agent, index) => ({
    workshopAgentId: deploymentState.agents[agent.ticker].id,
    name: agent.name,
    ticker: agent.ticker,
    personality: agent.personality,
    capabilities: agent.capabilities,
    description: agent.description,
    virtualAmount: DEPLOYMENT_CONFIG.agents.virtualPerAgent.toString(),
    // Enhanced configuration with ACP and G.A.M.E. support
    enableACP: true,
    enableGame: true,
    goal: `Execute ${agent.description} with maximum efficiency and profitability`,
    worldInfo: `BitForge Workshop environment with ${agent.capabilities.length} specialized capabilities`,
    customConfig: ethers.utils.defaultAbiCoder.encode(
      ["string", "string[]", "uint8", "bool", "bool"],
      [agent.description, agent.capabilities, agent.guild, true, true] // ACP and G.A.M.E. enabled
    ),
    // ACP-specific configuration
    acpProfile: {
      specializations: agent.capabilities,
      isEvaluator: agent.guild === 4 || agent.guild === 1, // Damascus and Aegis can be evaluators
      evaluationFee: agent.guild === 4 ? "100000000000000000" : "50000000000000000" // 0.1 ETH or 0.05 ETH
    },
    // G.A.M.E. specific configuration
    gameConfig: {
      workers: [
        {
          description: `${agent.name} primary execution worker`,
          capabilities: agent.capabilities
        },
        {
          description: `${agent.name} risk management worker`,
          capabilities: ["Risk Assessment", "Portfolio Monitoring", "Emergency Response"]
        },
        {
          description: `${agent.name} communication worker`,
          capabilities: ["ACP Communication", "Transaction Negotiation", "Evaluation"]
        }
      ]
    }
  }));
  
  fs.writeFileSync(
    path.join(deploymentDir, "agent-configs.json"),
    JSON.stringify(agentConfigs, null, 2)
  );
  
  // Generate contract ABIs
  const contractABIs = {};
  for (const [name, address] of Object.entries(deploymentState.contracts)) {
    try {
      const contract = await ethers.getContractAt(
        name.charAt(0).toUpperCase() + name.slice(1),
        address
      );
      contractABIs[name] = contract.interface.format(ethers.utils.FormatTypes.json);
    } catch (error) {
      console.log(`Warning: Could not get ABI for ${name}`);
    }
  }
  
  fs.writeFileSync(
    path.join(deploymentDir, "contract-abis.json"),
    JSON.stringify(contractABIs, null, 2)
  );
  
  // Generate deployment summary
  const summary = {
    network: deploymentState.network,
    timestamp: new Date(deploymentState.timestamp).toISOString(),
    deployer: deploymentState.deployer,
    contracts: deploymentState.contracts,
    agents: Object.keys(deploymentState.agents).length,
    totalCost: ethers.utils.formatEther(deploymentState.totalCost),
    gasUsed: deploymentState.gasUsed,
    readyForVirtuals: true,
    nextSteps: [
      "Fund contracts with initial liquidity",
      "Deploy agents to Virtuals Protocol using agent-configs.json",
      "Configure agent personalities and capabilities",
      "Begin revenue generation activities"
    ]
  };
  
  fs.writeFileSync(
    path.join(deploymentDir, "summary.json"),
    JSON.stringify(summary, null, 2)
  );
  
  console.log(`✅ Deployment artifacts generated in: ${deploymentDir}`);
  console.log("");
}

async function trackDeployment(tx) {
  const receipt = await tx.wait();
  deploymentState.gasUsed += receipt.gasUsed.toNumber();
  deploymentState.totalCost = deploymentState.totalCost.add(
    receipt.gasUsed.mul(receipt.effectiveGasPrice)
  );
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 