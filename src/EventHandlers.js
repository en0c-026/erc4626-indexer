const { ERC4626Contract } = require("../generated/src/Handlers.bs.js");
const BigNumber = require('bignumber.js');

const constants = {
  assetDecimals: 6,
  shareDecimals: 18
}

function addLiquidity(_assets, _shares, newAssets, newShares) {
  const assets = new BigNumber(_assets).plus(newAssets);
  const shares = new BigNumber(_shares).plus(newShares);
  return { assets, shares };
}

function removeLiquidity(_assets, _shares, newAssets, newShares) {
  const assets = new BigNumber(_assets).isGreaterThan(newAssets) ?
    new BigNumber(_assets).minus(newAssets) : new BigNumber(newAssets).minus(_assets);

  const shares = new BigNumber(_shares).isGreaterThan(newShares) ?
    new BigNumber(_shares).minus(newShares) : new BigNumber(newShares).minus(_shares);

  return { assets, shares };
}

function calculateRatioAndExchangeRate(_assets, _shares) {
  const assets = new BigNumber(_assets).dividedBy(10 ** constants.assetDecimals);
  const shares = new BigNumber(_shares).dividedBy(10 ** constants.shareDecimals);
  const total = assets.plus(shares);
  const assetsProportion = assets.dividedBy(total);
  const sharesProportion = shares.dividedBy(total);
  const exchangeRate = assets.dividedBy(shares);

  return { assetsProportion, sharesProportion, exchangeRate };
}

ERC4626Contract.Deposit.loader((event, context) => {
  context.TokenVault.load(event.srcAddress.toString());
});

ERC4626Contract.Deposit.handler((event, context) => {
  const vaultId = event.srcAddress.toString();
  const depositId = event.transactionHash + event.logIndex;
  const params = event.params;

  let existingTokenVault = context.TokenVault.get(vaultId);

  if (existingTokenVault !== undefined) {
    const { assets, shares } = addLiquidity(
      existingTokenVault.assets,
      existingTokenVault.shares,
      params.assets,
      params.shares
    );

    const {
      assetsProportion,
      sharesProportion,
      exchangeRate
    } = calculateRatioAndExchangeRate(assets, shares);

    context.TokenVault.set({
      id: vaultId,
      assets: assets.toFixed(),
      assetsProportion,
      shares: shares.toFixed(),
      sharesProportion,
      exchangeRate: exchangeRate.toFixed()
    });
  } else {
    const {
      assetsProportion,
      sharesProportion,
      exchangeRate
    } = calculateRatioAndExchangeRate(params.assets, params.shares);

    context.TokenVault.set({
      id: vaultId,
      assets: params.assets,
      assetsProportion,
      shares: params.shares,
      sharesProportion,
      exchangeRate: exchangeRate.toFixed()
    });
  }

  context.Deposit.set({
    id: depositId,
    sender: params.sender,
    owner: params.owner,
    assets: params.assets,
    shares: params.shares,
    vault: vaultId
  })
});

ERC4626Contract.Withdraw.loader((event, context) => {
  context.TokenVault.load(event.srcAddress.toString());
});

ERC4626Contract.Withdraw.handler((event, context) => {
  const vaultId = event.srcAddress.toString();
  const withdrawalId = event.transactionHash + event.logIndex;
  const params = event.params;

  let existingTokenVault = context.TokenVault.get(vaultId);

  if (existingTokenVault !== undefined) {
    const { assets, shares } = removeLiquidity(
      existingTokenVault.assets,
      existingTokenVault.shares,
      params.assets,
      params.shares
    );

    const {
      assetsProportion,
      sharesProportion,
      exchangeRate
    } = calculateRatioAndExchangeRate(assets, shares);

    context.TokenVault.set({
      id: vaultId,
      assets: assets.toFixed(),
      assetsProportion,
      shares: shares.toFixed(),
      sharesProportion,
      exchangeRate: exchangeRate.toFixed()
    });
  }

  context.Withdrawal.set({
    id: withdrawalId,
    sender: params.sender,
    receiver: params.receiver,
    owner: params.owner,
    assets: params.assets,
    shares: params.shares,
    vault: vaultId
  })
});
