import { ethers } from "hardhat";
import {Token as TokenType} from '../typechain/Token'
async function main() {
  const Token = await ethers.getContractFactory("Token");

  const firstToken: TokenType = await Token.deploy("Mango Token", "ManT", 1000);
  await firstToken.deployed();
  console.log("First token deployed to:", firstToken.address);

  const secondToken: TokenType = await Token.deploy("Banana Token", "BanT", 1000);
  await secondToken.deployed();
  console.log("Second token deployed to:", secondToken.address);

  const Factory = await ethers.getContractFactory("Factory");
  const factory = await Factory.deploy()
  await factory.deployed()
  console.log("Factory deployed to:", factory.address);

  const Exchange = await ethers.getContractFactory('Exchange')

  const firstExchange = await Exchange.deploy(firstToken.address);
  await firstExchange.deployed();
  console.log("First exchange deployed to:", firstExchange.address);

  const secondExchange = await Exchange.deploy(secondToken.address);
  await secondExchange.deployed();
  console.log("Second exchange deployed to:", secondExchange.address);



}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
