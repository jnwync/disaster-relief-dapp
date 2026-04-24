import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  // Validate environment variables
  const validator1 = process.env.VALIDATOR_1;
  const validator2 = process.env.VALIDATOR_2;
  const validator3 = process.env.VALIDATOR_3;

  if (!validator1 || !validator2 || !validator3) {
    throw new Error("Missing VALIDATOR_1, VALIDATOR_2, or VALIDATOR_3 in .env");
  }

  const validators: [string, string, string] = [validator1, validator2, validator3];
  const disasterName = "Hurricane Relief";

  console.log("Deploying DisasterRelief...");
  console.log("Disaster:", disasterName);
  console.log("Validators:", validators);

  const DisasterRelief = await hre.ethers.getContractFactory("DisasterRelief");
  const contract = await DisasterRelief.deploy(disasterName, validators);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const network = await hre.ethers.provider.getNetwork();

  console.log("DisasterRelief deployed to:", contractAddress);
  console.log("Network:", network.name, "ChainId:", network.chainId.toString());

  // Export ABI
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/DisasterRelief.sol/DisasterRelief.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const frontendContractsDir = path.join(__dirname, "../frontend/src/contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  // Write ABI
  const abiPath = path.join(frontendContractsDir, "DisasterRelief.json");
  fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
  console.log("ABI exported to:", abiPath);

  // Write deployment metadata
  const deploymentMetadata = {
    contractAddress,
    network: network.name === "unknown" ? "sepolia" : network.name,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    contractName: "DisasterRelief",
  };

  const deploymentPath = path.join(frontendContractsDir, "deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentMetadata, null, 2));
  console.log("Deployment metadata exported to:", deploymentPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
