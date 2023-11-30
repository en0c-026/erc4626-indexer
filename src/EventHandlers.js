const { ERC4626Contract } = require("../generated/src/Handlers.bs.js");
const BigNumber = require('bignumber.js');

function addLiquidity(_assets, _shares, newAssets, newShares) {
  const assets = BigInt(_assets) + BigInt(newAssets);
  const shares = BigInt(_shares) + BigInt(newShares);
  return { assets, shares };
}

function removeLiquidity(_assets, _shares, newAssets, newShares) {
  const assets = BigInt(_assets) > BigInt(newAssets) ? BigInt(_assets) - BigInt(newAssets) : BigInt(newAssets) - BigInt(_assets);
  const shares = BigInt(_shares) > BigInt(newShares) ? BigInt(_shares) - BigInt(newShares) : BigInt(newShares) - BigInt(_shares);

  return { assets, shares };
}


function calculateRatioAndExchangeRate(_assets, _shares) {
  const total = new BigNumber(_assets).plus(_shares);
  const assetsProportion = new BigNumber(_assets).dividedBy(total).toFormat(2);
  const sharesProportion = new BigNumber(_shares).dividedBy(total).toFormat(2);
  const exchangeRate = new BigNumber(_assets).dividedBy(_shares).toFormat(2);

  return { assetsProportion, sharesProportion, exchangeRate };
}



ERC4626Contract.Deposit.loader((event, context) => {
  context.TokenVault.load(event.srcAddress.toString());
});

ERC4626Contract.Deposit.handler((event, context) => {
  const vaultId = event.srcAddress.toString();
  const depositId = event.transactionHash + "-" + event.logIndex;
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
      assets: assets,
      assetsProportion,
      shares: shares,
      sharesProportion,
      exchangeRate: exchangeRate
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
      exchangeRate: exchangeRate
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
  const withdrawalId = event.transactionHash + "-" + event.logIndex;
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
      assets: assets,
      assetsProportion,
      shares: shares,
      sharesProportion,
      exchangeRate: exchangeRate
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
