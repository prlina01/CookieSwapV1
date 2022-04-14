import {expect} from "chai"
import { ethers } from "hardhat";
import {Token, Exchange, Factory} from "../typechain";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";

const toWei = (value: number) => ethers.utils.parseEther(value.toString());


describe("Factory", () => {
    let owner: SignerWithAddress;
    let factory: Factory;
    let token: Token;

    beforeEach(async () => {
        [owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("Token", "TKN", toWei(1000000));
        await token.deployed();

        const Factory = await ethers.getContractFactory("Factory");
        factory = await Factory.deploy();
        await factory.deployed();
    });

    it("is deployed", async () => {
        expect(await factory.deployed()).to.equal(factory);
    });

    describe("createExchange", () => {
        it("deploys an exchange", async () => {

            await factory.createExchange(token.address, "LpToken1", "LPT1")
            let exchangeAddress = await factory.getExchange(token.address)
            expect(await factory.tokenToExchange(token.address)).to.equal(
                exchangeAddress
            );

            const Exchange = await ethers.getContractFactory("Exchange");
            const exchange = await Exchange.attach(exchangeAddress);
            expect(await exchange.name()).to.equal("LpToken1");
            expect(await exchange.symbol()).to.equal("LPT1");
            expect(await exchange.factoryAddress()).to.equal(factory.address);
        });

        it("doesn't allow zero address", async () => {
            await expect(
                factory.createExchange("0x0000000000000000000000000000000000000000", "LpToken1", "LPT1" )
            ).to.be.revertedWith("invalid token address");
        });

        it("fails when exchange exists", async () => {
            await factory.createExchange(token.address, "LpToken1", "LPT1");

            await expect(factory.createExchange(token.address, "LpToken1", "LPT1")).to.be.revertedWith(
                "exchange already exists"
            );
        });
    });

    describe("getExchange", () => {
        it("returns exchange address by token address", async () => {
            await factory.createExchange(token.address, "LpToken1", "LPT1")
            let exchangeAddress = await factory.getExchange(token.address)

            expect(await factory.getExchange(token.address)).to.equal(
                exchangeAddress
            );
        });
    });
});