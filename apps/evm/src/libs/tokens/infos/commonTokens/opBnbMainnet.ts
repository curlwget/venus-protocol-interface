import btcbLogo from 'libs/tokens/img/underlyingTokens/btcb.svg';
import ethLogo from 'libs/tokens/img/underlyingTokens/eth.svg';
import fdusdLogo from 'libs/tokens/img/underlyingTokens/fdusd.svg';
import usdtLogo from 'libs/tokens/img/underlyingTokens/usdt.svg';
import wbnbLogo from 'libs/tokens/img/underlyingTokens/wbnb.svg';
import xvsLogo from 'libs/tokens/img/underlyingTokens/xvs.svg';
import type { Token } from 'types';
import { bnb } from '../nativeTokens';

export const tokens: Token[] = [
  bnb,
  {
    address: '0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61',
    decimals: 18,
    symbol: 'XVS',
    asset: xvsLogo,
  },
  {
    address: '0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2',
    decimals: 18,
    symbol: 'BTCB',
    asset: btcbLogo,
  },
  {
    address: '0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea',
    decimals: 18,
    symbol: 'ETH',
    asset: ethLogo,
  },
  {
    address: '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3',
    decimals: 18,
    symbol: 'USDT',
    asset: usdtLogo,
  },
  {
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    decimals: 18,
    symbol: 'FDUSD',
    asset: fdusdLogo,
  },
  {
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
    symbol: 'WBNB',
    asset: wbnbLogo,
    tokenWrapped: bnb,
  },
];
