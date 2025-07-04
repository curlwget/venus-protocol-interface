import BigNumber from 'bignumber.js';

import { poolData } from '__mocks__/models/pools';
import { weth } from '__mocks__/models/tokens';

import type { Asset, Pool } from 'types';

export const fakePool: Pool = {
  ...poolData[0],
  userBorrowBalanceCents: new BigNumber(10),
  userBorrowLimitCents: new BigNumber(1000),
  userLiquidationThresholdCents: new BigNumber(1100),
};

export const fakeAsset = fakePool.assets[0];
fakeAsset.userSupplyBalanceTokens = new BigNumber(1000);
fakeAsset.userWalletBalanceTokens = new BigNumber(10000000);
fakeAsset.tokenPriceCents = new BigNumber(100);

export const fakeVTokenBalanceMantissa = new BigNumber(10000000);

export const fakeWethAsset: Asset = {
  ...fakeAsset,
  vToken: {
    ...fakeAsset.vToken,
    underlyingToken: weth,
  },
};
