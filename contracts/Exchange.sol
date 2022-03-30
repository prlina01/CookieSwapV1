pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Exchange {
    address public tokenAddress;

    constructor(address _token) {
        require(_token != address(0), "Invalid token address");

        tokenAddress = _token;
    }

    function addLiquidity(uint _tokenAmount) public payable {
        IERC20 token = IERC20(tokenAddress);
        token.transferFrom(msg.sender, address(this), _tokenAmount);
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

        return (outputReserve * inputAmount) / (inputReserve + inputAmount); // dy = (y*dx)/(x+dx)
    }

    function getTokenAmount(uint _ethSold) public view returns(uint) {
        require(_ethSold > 0, "Amount of sold eth is too low.");

        uint tokenReserve = getReserve();
        return getAmount(_ethSold, address(this).balance, tokenReserve);
    }

    function getEthAmount(uint256 _tokenSold) public view returns (uint256) {
        require(_tokenSold > 0, "tokenSold is too small");

        uint256 tokenReserve = getReserve();

        return getAmount(_tokenSold, tokenReserve, address(this).balance);
    }

    function ethToTokenSwap(uint256 _minTokens) public payable {
        uint256 tokenReserve = getReserve();
        uint256 tokensBought = getAmount(
            msg.value, address(this).balance - msg.value, tokenReserve
        );

        require(tokensBought >= _minTokens, "insufficient output amount");

        IERC20(tokenAddress).transfer(msg.sender, tokensBought);
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

}
