![puniswap v2](https://user-images.githubusercontent.com/36077702/163594659-d857cfcc-26b9-47cd-9cf3-d3227a7a25e0.png)

Designed with simplicity in mind, and completely inspired by UniswapV1, **UniswapV1 Clone** protocol provides an interface for seamless exchange of ERC20 tokens on Ethereum. By eliminating unnecessary forms of rent extraction and middlemen it allows faster, more efficient exchange. Where it makes tradeoffs, decentralization, censorship resistance, and security are prioritized.

**UniswapV1 Clone** is open source and functions as a public good. There is no central token or platform fee. No special treatment is given to early investors, adopters, or developers. Token listing is open and free. All smart contract functions are public and all upgrades are opt-in.

### You can access the application here: https://uniswap-v1-clone.vercel.app/
*To interact with the app you will need a wallet connected to the **rinkeby** testnet.



## Features
* Join liquidity pools to collect fees on ETH-ERC20 pairs
* Liquidity-sensitive automated pricing using constant product formula
* Trade ETH for any ERC20 without wrapping
* Trade two ERC20 tokens in a single transaction

![Screenshot from 2022-04-15 18-25-42](https://user-images.githubusercontent.com/36077702/163595876-5b464348-82d8-49be-a753-a9b2056a2088.png)
![Screenshot from 2022-04-15 18-25-58](https://user-images.githubusercontent.com/36077702/163595880-8784e8ea-9096-4213-9b80-82225b9ed3a0.png)


## How it works

**UniswapV1 Clone** is made up of a two ETH-ERC20 exchange contracts. 
There is exactly one exchange contract per ERC20 token. 
New token exchanges might be added in the near future using the UniswapV1Clone factory contract. 
The factory serves as a public registry and is used to look up all token and exchange addresses added to the system.

Each exchange holds reserves of both ETH and its associated ERC20 token. Anyone can become a liquidity provider on an exchange and contribute to its reserves. This is different than buying or selling; it requires depositing an equivalent value of both ETH and the relevant ERC20 token. Liquidity is pooled across all providers and an internal "pool token" (ERC20) is used to track each providers relative contribution. Pool tokens are minted when liquidity is deposited into the system and can be burned at any time to withdraw a proportional share of the reserves.

Exchange contracts are automated market makers between an ETH-ERC20 pair. Traders can swap between the two in either direction by adding to the liquidity reserve of one and withdrawing from the reserve of the other. Since ETH is a common pair for all ERC20 exchanges, it can be used as an intermediary allowing direct ERC20-ERC20 trades in a single transaction.

UniswapV1 Clone uses a "constant product" market making formula which sets the exchange rate based off of the relative size of the ETH and ERC20 reserves, and the amount with which an incoming trade shifts this ratio. Selling ETH for ERC20 tokens increases the size of the ETH reserve and decreases the size of the ERC20 reserve. This shifts the reserve ratio, increasing the ERC20 token's price relative to ETH for subsequent transactions. The larger a trade relative to the total size of the reserves, the more price slippage will occur. Essentially, exchange contracts use the open financial market to decide on the relative value of a pair and uses that as a market making strategy.

A small liquidity provider fee (1%) is taken out of each trade and added to the reserves. While the ETH-ERC20 reserve ratio is constantly shifting, fees makes sure that the total combined reserve size increases with every trade. This functions as a payout to liquidity providers that is collected when they burn their pool tokens to withdraw their portion of total reserves. Guaranteed arbitrage opportunities from price fluctuations should push a steady flow of transactions through the system and increase the amount of fee revenue generated.
# Steps to set up the project on your local machine
**We are going to work with _rinekby_ testnet network while connecting to _Alchemy_.**

Rinkeby is an Ethereum test network that allows for blockchain development testing without paying gas fees with real money like on the mainnet.

Alchemy is a node provider. It helps your app communicate with contracts on the blockchain like a bridge.
### Setup
- install `npm` and `npx` on your machine
- run `npm install` to set up all the dependencies (hardhat, ethers, etc.)
- set up a [Metamask](https://metamask.io/download.html) wallet
- get free eth on rinkeby testnet [here](https://www.rinkebyfaucet.com//)
- set up an Alchemy account [here](https://alchemy.com/?a=641a319005)
- create`.env` file and then fill in the following environment variables with your own info
```shell
  ETHERSCAN_API_KEY=
  API_URL=
  PRIVATE_KEY=
```


### Commands:
- run `npx hardhat compile` if you want to compile your smart contracts
- run `npx hardhat run scripts/deploy.js --network rinkeby` to deploy the contract to the Rinkeby testnet
- modify `.config.ts` file with addresses from the previous command
- run `npm run dev` to start the local server; you should be able to access the app on `localhost:3000` 
- run `npx hardhat test` to run unit tests
- run `npx hardhat verify --network rinkeby <DEPLOYED_CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMS> ` to verify your contract on Etherscan
