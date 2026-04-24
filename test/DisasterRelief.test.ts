import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
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

  describe("Donations", function () {
    it("T2: Should accept donation and emit event", async function () {
      const { contract, donor1 } = await loadFixture(deployFixture);
      const amount = hre.ethers.parseEther("1.0");

      await expect(contract.connect(donor1).donate({ value: amount }))
        .to.emit(contract, "DonationReceived")
        .withArgs(donor1.address, amount, anyValue);

      expect(await contract.totalDonated()).to.equal(amount);
      expect(await contract.donorAmounts(donor1.address)).to.equal(amount);
      expect(await contract.getDonorCount()).to.equal(1);
    });

    it("T3: Should reject zero-value donation", async function () {
      const { contract, donor1 } = await loadFixture(deployFixture);

      await expect(
        contract.connect(donor1).donate({ value: 0 })
      ).to.be.revertedWith("DisasterRelief: donation must be greater than zero");
    });

    it("T14: receive() should accept ETH and emit event", async function () {
      const { contract, donor1 } = await loadFixture(deployFixture);
      const amount = hre.ethers.parseEther("0.5");

      await expect(
        donor1.sendTransaction({ to: await contract.getAddress(), value: amount })
      ).to.emit(contract, "DonationReceived");

      expect(await contract.totalDonated()).to.equal(amount);
      expect(await contract.getDonorCount()).to.equal(1);
    });

    it("T18: Should reject donation when inactive", async function () {
      const { contract, validator1, donor1 } = await loadFixture(deployFixture);
      await contract.connect(validator1).setActive(false);

      await expect(
        contract.connect(donor1).donate({ value: hre.ethers.parseEther("1.0") })
      ).to.be.revertedWith("DisasterRelief: fund is not active");
    });

    it("T22: Should track unique donors correctly", async function () {
      const { contract, donor1 } = await loadFixture(deployFixture);
      const amount = hre.ethers.parseEther("1.0");

      await contract.connect(donor1).donate({ value: amount });
      await contract.connect(donor1).donate({ value: amount });

      expect(await contract.getDonorCount()).to.equal(1);
      expect(await contract.donorAmounts(donor1.address)).to.equal(amount * 2n);
      expect(await contract.totalDonated()).to.equal(amount * 2n);
    });
  });

  describe("Beneficiary Registration", function () {
    it("T11: Should reject zero-address beneficiary", async function () {
      const { contract, validator1 } = await loadFixture(deployFixture);

      await expect(
        contract.connect(validator1).registerBeneficiary(hre.ethers.ZeroAddress)
      ).to.be.revertedWith("DisasterRelief: invalid beneficiary address");
    });

    it("T12: Should reject duplicate beneficiary registration", async function () {
      const { contract, validator1, donor1 } = await loadFixture(deployFixture);

      await contract.connect(validator1).registerBeneficiary(donor1.address);

      await expect(
        contract.connect(validator1).registerBeneficiary(donor1.address)
      ).to.be.revertedWith("DisasterRelief: beneficiary already registered");
    });

    it("Should register beneficiary and emit event", async function () {
      const { contract, validator1, donor1 } = await loadFixture(deployFixture);

      await expect(contract.connect(validator1).registerBeneficiary(donor1.address))
        .to.emit(contract, "BeneficiaryRegistered")
        .withArgs(donor1.address, validator1.address);

      expect(await contract.beneficiaries(donor1.address)).to.equal(true);
    });

    it("Should reject registration by non-validator", async function () {
      const { contract, nonValidator, donor1 } = await loadFixture(deployFixture);

      await expect(
        contract.connect(nonValidator).registerBeneficiary(donor1.address)
      ).to.be.revertedWith("DisasterRelief: caller is not a validator");
    });
  });
});
