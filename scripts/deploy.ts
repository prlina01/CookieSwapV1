import { ethers } from "hardhat";
import {Token as TokenType} from '../typechain/Token'
async function main() {
  const Token = await ethers.getContractFactory("Token");

  const firstToken: TokenType = await Token.deploy("Mango Token", "ManT", 1000 * (10**18));
  await firstToken.deployed();
  console.log("First token deployed to:", firstToken.address);

  const secondToken: TokenType = await Token.deploy("Banana Token", "BanT", 1000 * (10**18));
  await secondToken.deployed();
  console.log("Second token deployed to:", secondToken.address);

  const Factory = await ethers.getContractFactory("Factory");
  const factory = await Factory.deploy()
  await factory.deployed()
  console.log("Factory deployed to:", factory.address);

  await factory.createExchange(firstToken.address)
  await factory.createExchange(secondToken.address)





}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
