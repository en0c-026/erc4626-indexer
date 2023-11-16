const { ethers } = require('ethers');

const constants = {
  assetDecimals: 6,
  shareDecimals: 18
}

function calculateRatioAndExchangeRate(_assets, _shares) {
  const assets = parseFloat(ethers.utils.formatUnits(_assets, constants.assetDecimals));
  const shares = parseFloat(ethers.utils.formatUnits(_shares, constants.shareDecimals));
  const total = assets + shares
  const assetsProportion = (assets / total).toFixed(4)
  const sharesProportion = (shares / total).toFixed(4)
  const exchangeRate = (assets / shares).toFixed(8)

  return { assetsProportion, sharesProportion, exchangeRate };
}

const a = BigInt(7000000000);
const s = BigInt(100000000000000000000);
// const f = BigInt(1009850216).toString();
// const d = BigInt(8959594184645792751).toString();

const result = calculateRatioAndExchangeRate(a, s);
console.log(result);
// console.log("Ratio of Token 1:", ratioToken1.toString());
// console.log("Ratio of Token 2:", ratioToken2.toString());
// console.log("Exchange Rate:", exchangeRate.toString());
