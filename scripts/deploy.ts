import { ethers } from "hardhat";
import {Token as TokenType} from '../typechain/Token'
async function main() {
  const Token = await ethers.getContractFactory("Token");

  const firstToken: TokenType = await Token.deploy("Mango Token", "ManT", ethers.utils.parseEther('1000'));
  await firstToken.deployed();
  console.log("First token deployed to:", firstToken.address);

  const secondToken: TokenType = await Token.deploy("Banana Token", "BanT", ethers.utils.parseEther('1000'));
  await secondToken.deployed();
  console.log("Second token deployed to:", secondToken.address);

  const Factory = await ethers.getContractFactory("Factory");
  const factory = await Factory.deploy()
  await factory.deployed()
  console.log("Factory deployed to:", factory.address);

  const firstExchange = await factory.createExchange(firstToken.address, "LP Token 2", "LPT1")
  await firstExchange.wait()
  const secondExchange = await factory.createExchange(secondToken.address, "LP Token 2", "LPT2")
  await secondExchange.wait()
  let firstExchangeAddress = await factory.getExchange(firstToken.address)
  let secondExchangeAddress = await factory.getExchange(secondToken.address)
  console.log("First exchange deployed to: ", firstExchangeAddress )
  console.log("Second exchange deployed to: ", secondExchangeAddress )





}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
