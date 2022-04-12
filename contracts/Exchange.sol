// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IFactory {
    function getExchange(address _tokenAddress) external view returns (address);
}

interface IExchange {
    function ethToTokenSwap(uint256 _minTokens) external payable;

    function ethToTokenTransfer(uint256 _minTokens, address _recipient) external payable;
    function getTokenAmount(uint _ethSold) external view returns(uint);
}


contract Exchange is ERC20 {
    address public tokenAddress;
    address public factoryAddress;

    constructor(address _token, string memory _lpTokenName, string memory _lpTokenSymbol) ERC20(_lpTokenName, _lpTokenSymbol) {
        require(_token != address(0), "Invalid token address");

        tokenAddress = _token;
        factoryAddress = msg.sender;
    }

    function addLiquidity(uint _tokenAmount) public payable returns (uint256) {
        if(getReserve() == 0) {
            IERC20 token = IERC20(tokenAddress);
            token.transferFrom(msg.sender, address(this), _tokenAmount);

            uint256 liquidity = address(this).balance;
            _mint(msg.sender, liquidity);

            return liquidity;
        } else {
            uint256 ethReserve = address(this).balance - msg.value;
            uint256 tokenReserve = getReserve();
            uint256 tokenAmount = (msg.value * tokenReserve) / ethReserve;
            require(_tokenAmount >= tokenAmount, "insufficient token amount");

            IERC20 token = IERC20(tokenAddress);
            token.transferFrom(msg.sender, address(this), tokenAmount);


            uint256 liquidity = (msg.value * totalSupply()) / ethReserve;
            _mint(msg.sender, liquidity);
            return liquidity;
        }
    }
    function getTokenAmountWhenAddingLiquidity(uint256 _ethAmount) public view returns(uint256) {
        uint256 ethReserve = address(this).balance;
        uint256 tokenReserve = getReserve();
        uint256 tokenAmount = (tokenReserve * _ethAmount) / ethReserve;
        return tokenAmount;
    }

    function getEthAndTokenByToken(uint256 _amount) public view returns(uint256, uint256) {
        uint256 ethAmount = (address(this).balance * _amount) / totalSupply();
        uint256 tokenAmount = (getReserve() * _amount) / totalSupply();
        return (ethAmount, tokenAmount);
    }

    function removeLiquidity(uint256 _amount) public returns (uint256, uint256) {
        require(_amount > 0, "invalid amount of tokens");

        (uint256 ethAmount, uint256 tokenAmount) = getEthAndTokenByToken(_amount);

        _burn(msg.sender, _amount);
        payable(msg.sender).transfer(ethAmount);
        IERC20(tokenAddress).transfer(msg.sender, tokenAmount);

        return (ethAmount, tokenAmount);
    }


    function getReserve() public view returns (uint) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }

//    function getPrice(uint inputReserve, uint outputReserve) public pure returns (uint) {
//        require(inputReserve > 0 && outputReserve > 0, "invalid reserves");
//
//        return (inputReserve * 1000) / outputReserve; // solidity supports only floor rounding
//    }

    function getAmount(uint inputAmount, uint inputReserve, uint outputReserve) private pure returns (uint) {
        require(inputReserve > 0 && outputReserve > 0, "invalid reserves");

        // take 1 % of inputAmount
        uint256 inputAmountWithFee = inputAmount * 99;
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 100) + inputAmountWithFee;

        return numerator / denominator;
//        return (outputReserve * inputAmount) / (inputReserve + inputAmount); // dy = (y*dx)/(x+dx)
    }

    function getTokenAmount(uint _ethSold) public view returns(uint) {
        require(_ethSold > 0, "Amount of sold eth is too low.");

        uint tokenReserve = getReserve();
        return getAmount(_ethSold, address(this).balance, tokenReserve);
    }

    function getTokenAmountForTokenAmount(address _neededTokenAddress, uint256 _tokenAmount ) public view returns(uint256) {
        require(_tokenAmount > 0, "tokenAmount is too small");

        uint256 tokenReserve = getReserve();

        uint256 ethAmount =  getAmount(_tokenAmount, tokenReserve, address(this).balance);
        address exchangeAddress = IFactory(factoryAddress).getExchange(
            _neededTokenAddress
        );
        require(
            exchangeAddress != address(this) && exchangeAddress != address(0),
            "invalid exchange address"
        );

        return IExchange(exchangeAddress).getTokenAmount(ethAmount);
    }

    function getEthAmount(uint256 _tokenSold) public view returns (uint256) {
        require(_tokenSold > 0, "tokenSold is too small");

        uint256 tokenReserve = getReserve();

        return getAmount(_tokenSold, tokenReserve, address(this).balance);
    }

    function ethToToken(uint256 _minTokens, address recipient) private {
        uint256 tokenReserve = getReserve();
        uint256 tokensBought = getAmount(
            msg.value, address(this).balance - msg.value, tokenReserve
        );

        require(tokensBought >= _minTokens, "insufficient output amount");

        IERC20(tokenAddress).transfer(recipient, tokensBought);
    }

    function ethToTokenSwap(uint256 _minTokens) public payable {
        ethToToken(_minTokens, msg.sender);
    }

    function ethToTokenTransfer(uint256 _minTokens, address _recipient) public payable
    {
        ethToToken(_minTokens, _recipient);
    }


    function tokenToEthSwap(uint256 _tokensSold, uint256 _minEth) public {
        uint256 tokenReserve = getReserve();
        uint256 ethBought = getAmount(
            _tokensSold, tokenReserve, address(this).balance
        );

        require(ethBought >= _minEth, "insufficient output amount");

        IERC20(tokenAddress).transferFrom(msg.sender, address(this), _tokensSold);
        payable(msg.sender).transfer(ethBought);
    }

    function tokenToTokenSwap(
        uint256 _tokensSold,
        uint256 _minTokensBought,
        address _tokenAddress
    ) public {

        address exchangeAddress = IFactory(factoryAddress).getExchange(
            _tokenAddress
        );
        require(
            exchangeAddress != address(this) && exchangeAddress != address(0),
            "invalid exchange address"
        );

        uint256 tokenReserve = getReserve();
        uint256 ethBought = getAmount(
            _tokensSold,
            tokenReserve,
            address(this).balance
        );

        IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokensSold
        );

        IExchange(exchangeAddress).ethToTokenTransfer{value: ethBought}(
            _minTokensBought, msg.sender
        );
    }
}
