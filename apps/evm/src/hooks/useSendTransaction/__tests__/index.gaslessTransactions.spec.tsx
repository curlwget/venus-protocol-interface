import fakeAccountAddress from '__mocks__/models/address';
import fakeContractTransaction from '__mocks__/models/contractTransaction';
import { txData } from '__mocks__/models/transactionData';
import { useGetPaymasterInfo } from 'clients/api';
import { store } from 'containers/ResendPayingGasModal/store';
import { type UseIsFeatureEnabled, useIsFeatureEnabled } from 'hooks/useIsFeatureEnabled';
import { useUserChainSettings } from 'hooks/useUserChainSettings';
import { VError } from 'libs/errors';
import noop from 'noop-ts';
import { initialUserSettings } from 'store';
import { renderHook } from 'testUtils/render';
import { ChainId } from 'types';
import type { Mock } from 'vitest';
import type { Config as WagmiConfig } from 'wagmi';
import type { useSendTransaction as UseSendTransaction } from '..';
import { sendTransaction } from '../sendTransaction';
import { useTrackTransaction } from '../useTrackTransaction';

const { useSendTransaction }: { useSendTransaction: typeof UseSendTransaction } =
  await vi.importActual('hooks/useSendTransaction');

vi.mock('../useTrackTransaction');
vi.mock('../sendTransaction');

const mockWagmiConfig = {} as WagmiConfig;

vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi');

  return {
    ...actual,
    useConfig: vi.fn(() => mockWagmiConfig),
  };
});

vi.mock('hooks/useUserChainSettings', () => ({
  useUserChainSettings: vi.fn(() => [initialUserSettings[ChainId.ZKSYNC_SEPOLIA], vi.fn()]),
}));
vi.mock('containers/ResendPayingGasModal/store', () => ({
  store: {
    use: { openModal: vi.fn() },
  },
}));

const fakeHookInput = {
  fn: vi.fn(async () => txData),
  onConfirmed: noop,
  onReverted: noop,
};
const fakeMutationInput = {};

describe('useSendTransaction - Feature enabled: gaslessTransactions', () => {
  beforeEach(() => {
    (useIsFeatureEnabled as Mock).mockImplementation(
      ({ name }: UseIsFeatureEnabled) => name === 'gaslessTransactions',
    );

    (useGetPaymasterInfo as Mock).mockReturnValue({
      data: { canSponsorTransactions: true },
      refetch: vi.fn(),
    });
  });

  it('sends gasless transaction when conditions are met', async () => {
    const trackTransactionMock = vi.fn();
    (useTrackTransaction as Mock).mockImplementation(() => trackTransactionMock);

    (sendTransaction as Mock).mockReturnValue({ transactionHash: fakeContractTransaction.hash });

    const { result } = renderHook(() => useSendTransaction(fakeHookInput), {
      accountAddress: fakeAccountAddress,
      chainId: ChainId.BSC_TESTNET,
    });

    const { mutateAsync } = result.current;
    await mutateAsync(fakeMutationInput);

    expect(fakeHookInput.fn).toHaveBeenCalledTimes(1);
    expect(fakeHookInput.fn).toHaveBeenCalledWith(fakeMutationInput);

    expect(sendTransaction).toHaveBeenCalledWith({
      txData,
      gasless: true,
      wagmiConfig: mockWagmiConfig,
      chainId: ChainId.BSC_TESTNET,
      accountAddress: fakeAccountAddress,
    });

    expect(trackTransactionMock).toHaveBeenCalledTimes(1);
    expect(trackTransactionMock).toHaveBeenCalledWith({
      transactionHash: fakeContractTransaction.hash,
      onConfirmed: expect.any(Function),
      onReverted: expect.any(Function),
    });
  });

  it('handles gasless transaction error and opens ResendPayingGasModal', async () => {
    const refetchMock = vi.fn();
    (useGetPaymasterInfo as Mock).mockReturnValue({
      data: { canSponsorTransactions: true },
      refetch: refetchMock,
    });

    const trackTransactionMock = vi.fn();
    (useTrackTransaction as Mock).mockImplementation(() => trackTransactionMock);

    const errorCode = 'gaslessTransactionNotAvailable';

    (sendTransaction as Mock).mockRejectedValue(
      new VError({
        type: 'unexpected',
        code: errorCode,
      }),
    );

    const openModalMock = vi.fn();
    (store.use.openModal as Mock).mockImplementation(() => openModalMock);

    const customFakeHookInput = {
      ...fakeHookInput,
      options: {
        tryGasless: true,
      },
    };

    const { result } = renderHook(() => useSendTransaction(customFakeHookInput), {
      accountAddress: fakeAccountAddress,
      chainId: ChainId.BSC_TESTNET,
    });

    const { mutateAsync } = result.current;
    await expect(mutateAsync(fakeMutationInput)).rejects.toThrow(errorCode);

    expect(fakeHookInput.fn).toHaveBeenCalledTimes(1);
    expect(fakeHookInput.fn).toHaveBeenCalledWith(fakeMutationInput);

    expect(sendTransaction).toHaveBeenCalledWith({
      txData,
      gasless: true,
      wagmiConfig: mockWagmiConfig,
      chainId: ChainId.BSC_TESTNET,
      accountAddress: fakeAccountAddress,
    });

    expect(trackTransactionMock).not.toHaveBeenCalled();

    expect(refetchMock).toHaveBeenCalledTimes(1);

    expect(openModalMock).toHaveBeenCalledTimes(1);
    expect(openModalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        lastFailedGaslessTransaction: {
          ...customFakeHookInput,
          mutationInput: fakeMutationInput,
        },
      }),
    );
  });

  it('falls back to regular transaction when paymaster can not sponsor them', async () => {
    const trackTransactionMock = vi.fn();
    (useTrackTransaction as Mock).mockImplementation(() => trackTransactionMock);

    (useGetPaymasterInfo as Mock).mockReturnValue({
      data: { canSponsorTransactions: false },
      refetch: vi.fn(),
    });

    (sendTransaction as Mock).mockReturnValue({ transactionHash: fakeContractTransaction.hash });

    const { result } = renderHook(() => useSendTransaction(fakeHookInput), {
      accountAddress: fakeAccountAddress,
      chainId: ChainId.BSC_TESTNET,
    });

    const { mutateAsync } = result.current;
    await mutateAsync(fakeMutationInput);

    expect(fakeHookInput.fn).toHaveBeenCalledTimes(1);
    expect(fakeHookInput.fn).toHaveBeenCalledWith(fakeMutationInput);

    expect(sendTransaction).toHaveBeenCalledWith({
      txData,
      gasless: false,
      wagmiConfig: mockWagmiConfig,
      chainId: ChainId.BSC_TESTNET,
      accountAddress: fakeAccountAddress,
    });

    expect(trackTransactionMock).toHaveBeenCalledTimes(1);
    expect(trackTransactionMock).toHaveBeenCalledWith({
      transactionHash: fakeContractTransaction.hash,
      onConfirmed: expect.any(Function),
      onReverted: expect.any(Function),
    });
  });

  it('falls back to regular transaction when tryGasless option is false', async () => {
    const trackTransactionMock = vi.fn();
    (useTrackTransaction as Mock).mockImplementation(() => trackTransactionMock);

    (sendTransaction as Mock).mockReturnValue({ transactionHash: fakeContractTransaction.hash });

    const { result } = renderHook(
      () => useSendTransaction({ ...fakeHookInput, options: { tryGasless: false } }),
      {
        accountAddress: fakeAccountAddress,
        chainId: ChainId.BSC_TESTNET,
      },
    );
    const { mutateAsync } = result.current;
    await mutateAsync(fakeMutationInput);

    expect(fakeHookInput.fn).toHaveBeenCalledTimes(1);
    expect(fakeHookInput.fn).toHaveBeenCalledWith(fakeMutationInput);

    expect(sendTransaction).toHaveBeenCalledWith({
      txData,
      gasless: false,
      wagmiConfig: mockWagmiConfig,
      chainId: ChainId.BSC_TESTNET,
      accountAddress: fakeAccountAddress,
    });

    expect(trackTransactionMock).toHaveBeenCalledTimes(1);
    expect(trackTransactionMock).toHaveBeenCalledWith({
      transactionHash: fakeContractTransaction.hash,
      onConfirmed: expect.any(Function),
      onReverted: expect.any(Function),
    });
  });

  it('falls back to regular transaction when gasless user setting is disabled', async () => {
    (useUserChainSettings as Mock).mockReturnValue([{ gaslessTransactions: false }, vi.fn()]);

    const trackTransactionMock = vi.fn();
    (useTrackTransaction as Mock).mockImplementation(() => trackTransactionMock);

    (sendTransaction as Mock).mockReturnValue({ transactionHash: fakeContractTransaction.hash });

    const { result } = renderHook(() => useSendTransaction(fakeHookInput), {
      accountAddress: fakeAccountAddress,
      chainId: ChainId.BSC_TESTNET,
    });
    const { mutateAsync } = result.current;
    await mutateAsync(fakeMutationInput);

    expect(fakeHookInput.fn).toHaveBeenCalledTimes(1);
    expect(fakeHookInput.fn).toHaveBeenCalledWith(fakeMutationInput);

    expect(sendTransaction).toHaveBeenCalledWith({
      txData,
      gasless: false,
      wagmiConfig: mockWagmiConfig,
      chainId: ChainId.BSC_TESTNET,
      accountAddress: fakeAccountAddress,
    });

    expect(trackTransactionMock).toHaveBeenCalledTimes(1);
    expect(trackTransactionMock).toHaveBeenCalledWith({
      transactionHash: fakeContractTransaction.hash,
      onConfirmed: expect.any(Function),
      onReverted: expect.any(Function),
    });
  });
});
