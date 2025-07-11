import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import FunctionKey from 'constants/functionKey';
import { useGetContractAddress } from 'hooks/useGetContractAddress';
import { usePublicClient } from 'libs/wallet';
import { useChainId } from 'libs/wallet';
import type { ChainId } from 'types';
import { callOrThrow } from 'utilities';
import {
  type GetVaiVaultUserInfoInput,
  type GetVaiVaultUserInfoOutput,
  getVaiVaultUserInfo,
} from '.';

type TrimmedGetVaiVaultUserInfoInput = Omit<
  GetVaiVaultUserInfoInput,
  'publicClient' | 'vaiVaultAddress'
>;

export type UseGetVaiVaultUserInfoQueryKey = [
  FunctionKey.GET_VAI_VAULT_USER_INFO,
  TrimmedGetVaiVaultUserInfoInput & {
    chainId: ChainId;
  },
];

type Options = QueryObserverOptions<
  GetVaiVaultUserInfoOutput,
  Error,
  GetVaiVaultUserInfoOutput,
  GetVaiVaultUserInfoOutput,
  UseGetVaiVaultUserInfoQueryKey
>;

export const useGetVaiVaultUserInfo = (
  input: TrimmedGetVaiVaultUserInfoInput,
  options?: Partial<Options>,
) => {
  const { chainId } = useChainId();
  const { publicClient } = usePublicClient();
  const { address: vaiVaultAddress } = useGetContractAddress({
    name: 'VaiVault',
  });

  return useQuery({
    queryKey: [FunctionKey.GET_VAI_VAULT_USER_INFO, { ...input, chainId }],
    queryFn: () =>
      callOrThrow({ vaiVaultAddress }, params =>
        getVaiVaultUserInfo({ ...params, ...input, publicClient }),
      ),
    ...options,
    enabled: !!vaiVaultAddress && (options?.enabled === undefined || options?.enabled),
  });
};
