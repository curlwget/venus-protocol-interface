import { addresses } from 'libs/contracts';
import type { ChainId, Token, VToken } from 'types';
import areAddressesEqual from 'utilities/areAddressesEqual';
import findTokenByAddress from 'utilities/findTokenByAddress';

export interface GetContractNameInput {
  target: string;
  vTokens: VToken[];
  tokens: Token[];
  chainId: ChainId;
}

const getContractName = ({ target, vTokens, tokens, chainId }: GetContractNameInput) => {
  // Search within tokens
  const token = findTokenByAddress({
    tokens,
    address: target,
  });

  if (token) {
    return token.symbol;
  }

  // Search within vTokens
  const vToken = findTokenByAddress({
    address: target,
    tokens: vTokens,
  });

  if (vToken) {
    return vToken.symbol;
  }

  // Search within contracts
  const matchingUniqueContractInfo = Object.entries(addresses.uniques).find(
    ([_uniqueContractName, address]) => {
      const contractAddress = address[chainId];

      if (!contractAddress) {
        return false;
      }

      if (typeof contractAddress === 'string') {
        // Handle unique contracts
        return areAddressesEqual(contractAddress, target);
      }
    },
  );

  if (matchingUniqueContractInfo) {
    const contractName = matchingUniqueContractInfo[0];
    // Return "CorePoolComptroller" for the name of the legacy pool Comptroller contract in order to
    // make it easier for users to understand what pool is concerned here
    return contractName === 'LegacyPoolComptroller' ? 'CorePoolComptroller' : contractName;
  }

  return target;
};

export default getContractName;
