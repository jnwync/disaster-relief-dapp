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

  describe("Approval and Fund Release", function () {
    it("T6: Should reject approval by non-validator", async function () {
      const { contract, validator1, donor1, nonValidator } = await loadFixture(deployFixture);
      await contract.connect(donor1).donate({ value: hre.ethers.parseEther("5.0") });
      await contract.connect(validator1).registerBeneficiary(donor1.address);
      await contract.connect(validator1).proposeDisbursement(
        donor1.address, hre.ethers.parseEther("1.0"), "Test"
      );

      await expect(
        contract.connect(nonValidator).approveDisbursement(1)
      ).to.be.revertedWith("DisasterRelief: caller is not a validator");
    });

    it("T7: Should reject double vote by same validator", async function () {
      const { contract, validator1, donor1 } = await loadFixture(deployFixture);
      await contract.connect(donor1).donate({ value: hre.ethers.parseEther("5.0") });
      await contract.connect(validator1).registerBeneficiary(donor1.address);
      await contract.connect(validator1).proposeDisbursement(
        donor1.address, hre.ethers.parseEther("1.0"), "Test"
      );

      await contract.connect(validator1).approveDisbursement(1);

      await expect(
        contract.connect(validator1).approveDisbursement(1)
      ).to.be.revertedWith("DisasterRelief: validator already approved");
    });

    it("T8: Should reject approval of nonexistent proposal", async function () {
      const { contract, validator1 } = await loadFixture(deployFixture);

      await expect(
        contract.connect(validator1).approveDisbursement(999)
      ).to.be.revertedWith("DisasterRelief: proposal does not exist");
    });

    it("T9: Should reject approval of executed proposal", async function () {
      const { contract, validator1, validator2, validator3, donor1 } = await loadFixture(deployFixture);
      const amount = hre.ethers.parseEther("1.0");
      await contract.connect(donor1).donate({ value: hre.ethers.parseEther("5.0") });
      await contract.connect(validator1).registerBeneficiary(donor1.address);
      await contract.connect(validator1).proposeDisbursement(donor1.address, amount, "Test");

      await contract.connect(validator1).approveDisbursement(1);
      await contract.connect(validator2).approveDisbursement(1);

      await expect(
        contract.connect(validator3).approveDisbursement(1)
      ).to.be.revertedWith("DisasterRelief: proposal already executed");
    });

    it("T4: Happy path - full lifecycle", async function () {
      const { contract, validator1, validator2, donor1 } = await loadFixture(deployFixture);
      const donateAmount = hre.ethers.parseEther("5.0");
      const disburseAmount = hre.ethers.parseEther("1.0");

      // Donate
      await contract.connect(donor1).donate({ value: donateAmount });
      expect(await contract.totalDonated()).to.equal(donateAmount);

      // Register beneficiary
      await contract.connect(validator1).registerBeneficiary(donor1.address);
      expect(await contract.beneficiaries(donor1.address)).to.equal(true);

      // Propose
      await contract.connect(validator1).proposeDisbursement(
        donor1.address, disburseAmount, "Emergency supplies"
      );
      expect(await contract.proposalCount()).to.equal(1);

      // Get recipient balance before
      const balanceBefore = await hre.ethers.provider.getBalance(donor1.address);

      // Approve #1
      await expect(contract.connect(validator1).approveDisbursement(1))
        .to.emit(contract, "ProposalApproved")
        .withArgs(1, validator1.address, 1);

      // Approve #2 (triggers release)
      await expect(contract.connect(validator2).approveDisbursement(1))
        .to.emit(contract, "ProposalApproved")
        .withArgs(1, validator2.address, 2)
        .and.to.emit(contract, "FundsReleased")
        .withArgs(1, donor1.address, disburseAmount);

      // Verify state
      const proposal = await contract.getProposal(1);
      expect(proposal[4]).to.equal(true); // executed
      expect(proposal[3]).to.equal(2); // approvalCount
      expect(await contract.totalDisbursed()).to.equal(disburseAmount);

      // Verify recipient received funds
      const balanceAfter = await hre.ethers.provider.getBalance(donor1.address);
      expect(balanceAfter - balanceBefore).to.equal(disburseAmount);
    });

    it("T23: Multiple proposals with independent approvals", async function () {
      const { contract, validator1, validator2, validator3, donor1, donor2 } = await loadFixture(deployFixture);
      await contract.connect(donor1).donate({ value: hre.ethers.parseEther("10.0") });
      await contract.connect(validator1).registerBeneficiary(donor1.address);
      await contract.connect(validator1).registerBeneficiary(donor2.address);

      // Create two proposals
      await contract.connect(validator1).proposeDisbursement(
        donor1.address, hre.ethers.parseEther("1.0"), "Proposal A"
      );
      await contract.connect(validator1).proposeDisbursement(
        donor2.address, hre.ethers.parseEther("2.0"), "Proposal B"
      );

      // Approve proposal 2 first
      await contract.connect(validator2).approveDisbursement(2);
      await contract.connect(validator3).approveDisbursement(2);

      // Approve proposal 1
      await contract.connect(validator1).approveDisbursement(1);
      await contract.connect(validator2).approveDisbursement(1);

      const p1 = await contract.getProposal(1);
      const p2 = await contract.getProposal(2);
      expect(p1[4]).to.equal(true); // executed
      expect(p2[4]).to.equal(true); // executed
      expect(await contract.totalDisbursed()).to.equal(hre.ethers.parseEther("3.0"));
    });
  });

  describe("Proposal Creation", function () {
    it("T5: Should reject proposal by non-validator", async function () {
      const { contract, nonValidator, donor1, validator1 } = await loadFixture(deployFixture);
      await contract.connect(validator1).registerBeneficiary(donor1.address);

      await expect(
        contract.connect(nonValidator).proposeDisbursement(
          donor1.address,
          hre.ethers.parseEther("1.0"),
          "Test proposal"
        )
      ).to.be.revertedWith("DisasterRelief: caller is not a validator");
    });

    it("T13: Should reject proposal exceeding contract balance", async function () {
      const { contract, validator1, donor1 } = await loadFixture(deployFixture);
      await contract.connect(validator1).registerBeneficiary(donor1.address);

      await expect(
        contract.connect(validator1).proposeDisbursement(
          donor1.address,
          hre.ethers.parseEther("1.0"),
          "Test proposal"
        )
      ).to.be.revertedWith("DisasterRelief: insufficient contract balance");
    });

    it("T19: Should reject proposal when inactive", async function () {
      const { contract, validator1, donor1 } = await loadFixture(deployFixture);
      await contract.connect(validator1).registerBeneficiary(donor1.address);
      await contract.connect(validator1).setActive(false);

      await expect(
        contract.connect(validator1).proposeDisbursement(
          donor1.address,
          hre.ethers.parseEther("1.0"),
          "Test proposal"
        )
      ).to.be.revertedWith("DisasterRelief: fund is not active");
    });

    it("T20: Should reject proposal for non-beneficiary recipient", async function () {
      const { contract, validator1, donor1, donor2 } = await loadFixture(deployFixture);
      await contract.connect(donor1).donate({ value: hre.ethers.parseEther("5.0") });

      await expect(
        contract.connect(validator1).proposeDisbursement(
          donor2.address,
          hre.ethers.parseEther("1.0"),
          "Test proposal"
        )
      ).to.be.revertedWith("DisasterRelief: recipient is not a registered beneficiary");
    });

    it("T21: Should store correct descriptionHash", async function () {
      const { contract, validator1, donor1 } = await loadFixture(deployFixture);
      await contract.connect(donor1).donate({ value: hre.ethers.parseEther("5.0") });
      await contract.connect(validator1).registerBeneficiary(donor1.address);

      const description = "Emergency food supplies";
      const expectedHash = hre.ethers.solidityPackedKeccak256(["string"], [description]);

      await contract.connect(validator1).proposeDisbursement(
        donor1.address,
        hre.ethers.parseEther("1.0"),
        description
      );

      const proposal = await contract.getProposal(1);
      expect(proposal.descriptionHash).to.equal(expectedHash);
    });

    it("Should create proposal and emit event", async function () {
      const { contract, validator1, donor1 } = await loadFixture(deployFixture);
      await contract.connect(donor1).donate({ value: hre.ethers.parseEther("5.0") });
      await contract.connect(validator1).registerBeneficiary(donor1.address);

      const amount = hre.ethers.parseEther("1.0");
      const description = "Emergency food supplies";
      const descHash = hre.ethers.solidityPackedKeccak256(["string"], [description]);

      await expect(
        contract.connect(validator1).proposeDisbursement(donor1.address, amount, description)
      )
        .to.emit(contract, "ProposalCreated")
        .withArgs(1, donor1.address, amount, descHash);

      expect(await contract.proposalCount()).to.equal(1);

      const proposal = await contract.getProposal(1);
      expect(proposal.recipient).to.equal(donor1.address);
      expect(proposal.amount).to.equal(amount);
      expect(proposal.approvalCount).to.equal(0);
      expect(proposal.executed).to.equal(false);
      expect(proposal.exists).to.equal(true);
    });
  });
});
