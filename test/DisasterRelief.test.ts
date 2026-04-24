import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("DisasterRelief", function () {
  async function deployFixture() {
    const [deployer, validator1, validator2, validator3, donor1, donor2, nonValidator] =
      await hre.ethers.getSigners();

    const DisasterRelief = await hre.ethers.getContractFactory("DisasterRelief");
    const contract = await DisasterRelief.deploy("Test Disaster", [
      validator1.address,
      validator2.address,
      validator3.address,
    ]);

    return { contract, deployer, validator1, validator2, validator3, donor1, donor2, nonValidator };
  }

  describe("Deployment", function () {
    it("T1: Should set correct deployment state", async function () {
      const { contract, validator1, validator2, validator3 } = await loadFixture(deployFixture);

      expect(await contract.disasterName()).to.equal("Test Disaster");
      expect(await contract.isActive()).to.equal(true);
      expect(await contract.REQUIRED_APPROVALS()).to.equal(2);
      expect(await contract.proposalCount()).to.equal(0);
      expect(await contract.totalDonated()).to.equal(0);
      expect(await contract.totalDisbursed()).to.equal(0);

      const validators = await contract.getValidators();
      expect(validators[0]).to.equal(validator1.address);
      expect(validators[1]).to.equal(validator2.address);
      expect(validators[2]).to.equal(validator3.address);
    });
  });
});
