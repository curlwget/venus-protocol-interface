import BigNumber from 'bignumber.js';
import type { Mock } from 'vitest';

import { renderComponent } from 'testUtils/render';

import {
  useGetPools,
  useGetPrimeStatus,
  useGetPrimeToken,
  useGetXvsVaultUserInfo,
} from 'clients/api';

import { poolData } from '__mocks__/models/pools';
import { en } from 'libs/translations';
import PrimeStatusBanner from '..';
import TEST_IDS from '../testIds';

describe('PrimeStatusBanner', () => {
  const MOCK_DEFAULT_PRIME_STATUS = {
    claimWaitingPeriodSeconds: 600,
    userClaimTimeRemainingSeconds: 600,
    claimedPrimeTokenCount: 0,
    primeMarkets: [],
    primeTokenLimit: 1000,
    primeMinimumStakedXvsMantissa: new BigNumber('1000000'),
    xvsVault: '',
    xvsVaultPoolId: 1,
    rewardTokenAddress: '',
  };

  beforeEach(() => {
    vi.useFakeTimers();

    (useGetPools as Mock).mockImplementation(() => ({
      data: {
        pools: poolData,
      },
    }));
    (useGetPrimeStatus as Mock).mockImplementation(() => ({
      data: MOCK_DEFAULT_PRIME_STATUS,
    }));
    (useGetXvsVaultUserInfo as Mock).mockImplementation(() => ({
      data: {
        stakedAmountMantissa: new BigNumber('0'),
        pendingWithdrawalsTotalAmountMantissa: new BigNumber('0'),
      },
    }));
    (useGetPrimeToken as Mock).mockImplementation(() => ({
      data: {
        exists: false,
      },
    }));
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderComponent(<PrimeStatusBanner />);
  });

  it('renders nothing if user is Prime', () => {
    (useGetPrimeToken as Mock).mockImplementation(() => ({
      data: {
        exists: true,
      },
    }));

    const { queryByTestId } = renderComponent(<PrimeStatusBanner />);

    expect(queryByTestId(TEST_IDS.primeStatusBannerContainer)).toBeNull();
  });

  it('informs the user the requirements to be a Prime user', () => {
    const { queryByTestId } = renderComponent(<PrimeStatusBanner />);

    expect(queryByTestId(TEST_IDS.stakeXvsButton)).toBeVisible();
    expect(queryByTestId(TEST_IDS.stakeXvsButton)).toBeEnabled();
    expect(queryByTestId(TEST_IDS.primeStatusBannerContainer)).toBeVisible();
  });

  it('displays a warning when there are less than 5% of Prime tokens left', () => {
    (useGetPrimeStatus as Mock).mockImplementation(() => ({
      data: {
        ...MOCK_DEFAULT_PRIME_STATUS,
        claimedPrimeTokenCount: 999,
      },
    }));

    const { queryByTestId } = renderComponent(<PrimeStatusBanner />);

    expect(queryByTestId(TEST_IDS.primeTokensLeftWarning)).toBeVisible();
  });

  it('displays the time remaining to be a Prime user, when a user has staked enough XVS', () => {
    const text = '10 minutes until you can claim Prime rewards';
    (useGetXvsVaultUserInfo as Mock).mockImplementation(() => ({
      data: {
        stakedAmountMantissa: new BigNumber('1000000'),
        pendingWithdrawalsTotalAmountMantissa: new BigNumber('0'),
      },
    }));
    (useGetPrimeStatus as Mock).mockImplementation(() => ({
      data: {
        ...MOCK_DEFAULT_PRIME_STATUS,
        claimWaitingPeriodSeconds: 600,
        userClaimTimeRemainingSeconds: 600,
      },
    }));

    const { queryByTestId, queryByText } = renderComponent(<PrimeStatusBanner />);

    expect(queryByTestId(TEST_IDS.claimPrimeTokenButton)).toBeNull();
    expect(queryByText(text)).toBeVisible();
  });

  it('allows the user to claim a Prime token if all the criteria match', () => {
    (useGetXvsVaultUserInfo as Mock).mockImplementation(() => ({
      data: {
        stakedAmountMantissa: new BigNumber('1000000'),
        pendingWithdrawalsTotalAmountMantissa: new BigNumber('0'),
      },
    }));
    (useGetPrimeStatus as Mock).mockImplementation(() => ({
      data: {
        ...MOCK_DEFAULT_PRIME_STATUS,
        userClaimTimeRemainingSeconds: 0,
      },
    }));

    const { queryByTestId } = renderComponent(<PrimeStatusBanner />);

    expect(queryByTestId(TEST_IDS.claimPrimeTokenButton)).toBeVisible();
    expect(queryByTestId(TEST_IDS.claimPrimeTokenButton)).toBeEnabled();
  });

  it('shows the all Prime tokens claimed warning if all Prime tokens have been claimed', () => {
    (useGetPrimeStatus as Mock).mockImplementation(() => ({
      data: {
        ...MOCK_DEFAULT_PRIME_STATUS,
        claimedPrimeTokenCount: 1000,
      },
    }));

    const { queryByText } = renderComponent(<PrimeStatusBanner />);
    expect(queryByText(en.primeStatusBanner.noPrimeTokenWarning.text)).toBeVisible();
  });

  it('does not show the all Prime tokens claimed warning if there are no tokens to be claimed', () => {
    (useGetPrimeStatus as Mock).mockImplementation(() => ({
      data: {
        ...MOCK_DEFAULT_PRIME_STATUS,
        primeTokenLimit: 0,
      },
    }));

    const { queryByText } = renderComponent(<PrimeStatusBanner />);
    expect(queryByText(en.primeStatusBanner.noPrimeTokenWarning.text)).toBeNull();
  });
});
