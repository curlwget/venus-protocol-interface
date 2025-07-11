import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as renderComponentTl, renderHook as renderHookTl } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import type { Mock } from 'vitest';

import { MuiThemeProvider } from 'App/MuiThemeProvider';
import { Web3Wrapper, useAccountAddress, useAccountChainId, useChainId } from 'libs/wallet';
import { ChainId } from 'types';

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

interface Options {
  accountAddress?: string;
  accountChainId?: ChainId;
  chainId?: ChainId;
  routerInitialEntries?: string[];
  routePath?: string;
  queryClient?: QueryClient;
}

interface WrapperProps {
  children?: React.ReactNode;
  options?: Partial<Options>;
}

const Wrapper: React.FC<WrapperProps> = ({ children, options }) => {
  const chainId = options?.chainId || ChainId.BSC_TESTNET;

  if (options?.accountAddress) {
    const accountAddress = options?.accountAddress;

    (useAccountAddress as Mock).mockImplementation(() => ({
      accountAddress,
    }));

    (useAccountChainId as Mock).mockImplementation(() => ({
      chainId: options?.accountChainId || chainId,
    }));
  }

  (useChainId as Mock).mockImplementation(() => ({
    chainId,
  }));

  return (
    <MuiThemeProvider>
      <QueryClientProvider client={options?.queryClient || createQueryClient()}>
        <Web3Wrapper>
          <MemoryRouter initialEntries={options?.routerInitialEntries || ['/']}>
            <Routes>
              <Route path={options?.routePath || '/'} element={children} />
            </Routes>
          </MemoryRouter>
        </Web3Wrapper>
      </QueryClientProvider>
    </MuiThemeProvider>
  );
};

export const renderComponent = (children: ReactElement, options?: Partial<Options>) =>
  renderComponentTl(children, {
    wrapper: props => <Wrapper options={options} {...props} />,
  });

export const renderHook = <TProps, TResult>(
  hook: (props: TProps) => TResult,
  options?: Partial<Options>,
) =>
  renderHookTl(hook, {
    wrapper: props => <Wrapper options={options} {...props} />,
  });
