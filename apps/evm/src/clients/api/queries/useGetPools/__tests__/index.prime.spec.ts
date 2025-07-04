import { waitFor } from '@testing-library/dom';
import type { Mock } from 'vitest';

import apiPoolsResponse from '__mocks__/api/pools.json';
import fakeAccountAddress from '__mocks__/models/address';
import BigNumber from 'bignumber.js';
import { type GetTokenBalancesInput, getTokenBalances, getUserVaiBorrowBalance } from 'clients/api';
import { type UseIsFeatureEnabled, useIsFeatureEnabled } from 'hooks/useIsFeatureEnabled';

import {
  type UseGetContractAddressInput,
  useGetContractAddress,
} from 'hooks/useGetContractAddress';
import { usePublicClient } from 'libs/wallet';
import { renderHook } from 'testUtils/render';
import { restService } from 'utilities/restService';
import type { ReadContractParameters } from 'viem';
import { useGetPools } from '..';
import {
  fakeLegacyPoolComptrollerContractAddress,
  fakePoolLensContractAddress,
  fakePrimeContractAddress,
  fakePublicClient,
  fakeVaiControllerContractAddress,
  fakeVenusLensContractAddress,
} from '../__testUtils__/fakeData';

vi.mock('utilities/restService');

describe('useGetPools', () => {
  beforeEach(() => {
    (useIsFeatureEnabled as Mock).mockImplementation(
      ({ name }: UseIsFeatureEnabled) => name === 'prime',
    );

    (usePublicClient as Mock).mockImplementation(() => ({
      publicClient: fakePublicClient,
    }));

    (useGetContractAddress as Mock).mockImplementation(({ name }: UseGetContractAddressInput) => {
      let address = '0xFakeContractAddress';

      if (name === 'PoolLens') {
        address = fakePoolLensContractAddress;
      }

      if (name === 'LegacyPoolComptroller') {
        address = fakeLegacyPoolComptrollerContractAddress;
      }

      if (name === 'VenusLens') {
        address = fakeVenusLensContractAddress;
      }

      if (name === 'VaiController') {
        address = fakeVaiControllerContractAddress;
      }

      if (name === 'Prime') {
        address = fakePrimeContractAddress;
      }

      return {
        address,
      };
    });

    (restService as Mock).mockImplementation(async () => ({
      status: 200,
      data: apiPoolsResponse,
    }));

    (getTokenBalances as Mock).mockImplementation(
      ({ publicClient: _1, accountAddress: _2, tokens }: GetTokenBalancesInput) => ({
        tokenBalances: tokens.map(token => ({
          token,
          balanceMantissa: new BigNumber('10000000000000000000'),
        })),
      }),
    );

    (getUserVaiBorrowBalance as Mock).mockImplementation(() => ({
      userVaiBorrowBalanceMantissa: new BigNumber('1000000000000000000'),
    }));
  });

  it('fetches and formats Prime distributions and Prime distribution simulations if user is Prime', async () => {
    const { result } = renderHook(() =>
      useGetPools({
        accountAddress: fakeAccountAddress,
      }),
    );

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data).toMatchSnapshot();
  });

  it('does not fetch Prime distributions if user is not Prime', async () => {
    const customFakePublicClient = {
      ...fakePublicClient,
      readContract: vi.fn((input: ReadContractParameters) => {
        if (input.functionName === 'tokens' && input.address === fakePrimeContractAddress) {
          const isUserPrime = false;
          return [isUserPrime, false];
        }

        return fakePublicClient.readContract(input);
      }),
    };

    (usePublicClient as Mock).mockImplementation(() => ({
      publicClient: customFakePublicClient,
    }));

    const { result } = renderHook(() =>
      useGetPools({
        accountAddress: fakeAccountAddress,
      }),
    );

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toMatchSnapshot();
  });

  it('filters out Prime simulations that are 0', async () => {
    const customFakePublicClient = {
      ...fakePublicClient,
      readContract: vi.fn((input: ReadContractParameters) => {
        if (
          (input.functionName === 'estimateAPR' || input.functionName === 'calculateAPR') &&
          input.address === fakePrimeContractAddress
        ) {
          return {
            borrowAPR: 0n,
            supplyAPR: 0n,
          };
        }

        return fakePublicClient.readContract(input);
      }),
    };

    (usePublicClient as Mock).mockImplementation(() => ({
      publicClient: customFakePublicClient,
    }));

    const { result } = renderHook(() =>
      useGetPools({
        accountAddress: fakeAccountAddress,
      }),
    );

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toMatchSnapshot();
  });
});
