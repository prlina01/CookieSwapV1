import {expect} from "chai"
import { ethers } from "hardhat";
import {Token, Exchange, Factory} from "../typechain";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {BigNumber} from "@ethersproject/bignumber/src.ts/bignumber";


const toWei = (value: number) => ethers.utils.parseEther(value.toString());

const fromWei = (value: BigNumber | string) =>
    ethers.utils.formatEther(
        typeof value === "string" ? value : value.toString()
    );

const getBalance = ethers.provider.getBalance;




describe("Exchange", () => {
    let owner: SignerWithAddress;
    let user: SignerWithAddress;
    let token: Token;
    let exchange: Exchange;

    beforeEach(async () => {
        [owner, user] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("Token", "TKN", toWei(1000000));
        await token.deployed();

        const Exchange = await ethers.getContractFactory("Exchange");
        exchange = await Exchange.deploy(token.address, "gas ide", "gi1");
        await exchange.deployed();
    });


    describe("addLiquidity", async () => {
        describe("empty reserves", async () => {
            it("adds liquidity", async () => {
                await token.approve(exchange.address, toWei(200));
                await exchange.addLiquidity(toWei(200), { value: toWei(100) });

                expect(await getBalance(exchange.address)).to.equal(toWei(100));
                expect(await exchange.getReserve()).to.equal(toWei(200));
            });

            it("mints LP tokens", async () => {
                await token.approve(exchange.address, toWei(200));
                await exchange.addLiquidity(toWei(200), { value: toWei(100) });

                expect(await exchange.balanceOf(owner.address)).to.eq(toWei(100));
                expect(await exchange.totalSupply()).to.eq(toWei(100));
            });

            it("allows zero amounts", async () => {
                await token.approve(exchange.address, 0);
                await exchange.addLiquidity(0, { value: 0 });

                expect(await getBalance(exchange.address)).to.equal(0);
                expect(await exchange.getReserve()).to.equal(0);
            });
        });
})
    describe("existing reserves", async () => {
        beforeEach(async () => {
            await token.approve(exchange.address, toWei(300));
            await exchange.addLiquidity(toWei(200), { value: toWei(100) });
        });

        it("preserves exchange rate", async () => {
            await exchange.addLiquidity(toWei(200), { value: toWei(50) });

            expect(await getBalance(exchange.address)).to.equal(toWei(150));
            expect(await exchange.getReserve()).to.equal(toWei(300));
        });

        it("mints LP tokens", async () => {
            await exchange.addLiquidity(toWei(200), { value: toWei(50) });

            expect(await exchange.balanceOf(owner.address)).to.eq(toWei(150));
            expect(await exchange.totalSupply()).to.eq(toWei(150));
        });

        it("fails when not enough tokens", async () => {
            await expect(
                exchange.addLiquidity(toWei(50), { value: toWei(50) })
            ).to.be.revertedWith("insufficient token amount");
        });
    });
});
