import { fireEvent, waitFor } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import noop from 'noop-ts';
import type { Mock } from 'vitest';

import fakeAccountAddress from '__mocks__/models/address';
import { vai, xvs } from '__mocks__/models/tokens';
import { renderComponent } from 'testUtils/render';

import { getBalanceOf, useStakeInVault } from 'clients/api';
import { en } from 'libs/translations';

import StakeModal, { type StakeModalProps } from '..';
import TEST_IDS from '../../../TransactionForm/testIds';

const fakeBalanceMantissa = new BigNumber('100000000000000000000000');

const baseProps: StakeModalProps = {
  stakedToken: vai,
  rewardToken: xvs,
  poolIndex: 6,
  handleClose: noop,
};

describe('pages/Vault/modals/StakeModal', () => {
  beforeEach(() => {
    (getBalanceOf as Mock).mockImplementation(() => ({ balanceMantissa: fakeBalanceMantissa }));
  });

  it('renders without crashing', async () => {
    renderComponent(<StakeModal {...baseProps} />);
  });

  it('fetches and displays the user balance correctly', async () => {
    const { getByTestId } = renderComponent(<StakeModal {...baseProps} />, {
      accountAddress: fakeAccountAddress,
    });

    await waitFor(() =>
      expect(getByTestId(TEST_IDS.availableTokens).textContent).toMatchInlineSnapshot(
        `"Available VAI100K VAI"`,
      ),
    );
  });

  it('calls stake function then calls handleClose callback on success', async () => {
    const mockStake = vi.fn();
    (useStakeInVault as Mock).mockReturnValue({
      stake: mockStake,
    });

    const customProps: StakeModalProps = {
      ...baseProps,
      handleClose: vi.fn(),
    };

    const { getByTestId, getByText } = renderComponent(<StakeModal {...customProps} />, {
      accountAddress: fakeAccountAddress,
    });

    await waitFor(() => getByTestId(TEST_IDS.tokenTextField));

    const fakeValueTokens = '100';

    // Enter amount in input
    fireEvent.change(getByTestId(TEST_IDS.tokenTextField), {
      target: { value: fakeValueTokens },
    });

    await waitFor(() => getByText(en.stakeModal.submitButtonLabel));

    // Submit form
    const submitButton = getByText(en.stakeModal.submitButtonLabel).closest(
      'button',
    ) as HTMLButtonElement;
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockStake).toHaveBeenCalledTimes(1));
    expect(mockStake.mock.calls[0]).toMatchInlineSnapshot(`
      [
        {
          "amountMantissa": "100000000000000000000",
          "poolIndex": 6,
          "rewardToken": {
            "address": "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff",
            "asset": "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='24'%20height='24'%20fill='none'%20xmlns:v='https://vecta.io/nano'%3e%3cg%20clip-path='url(%23B)'%3e%3ccircle%20cx='12'%20cy='12'%20r='12'%20fill='%231f2028'/%3e%3cpath%20d='M18.957%209.442l-5.27%209.128c-.159.275-.388.504-.664.663s-.588.243-.906.243-.631-.084-.906-.243-.505-.387-.664-.663l-.924-1.599c-.003-.019%200-.023.004-.026.019-.003.023%200%20.026.004a1.52%201.52%200%200%200%201.267.425%201.52%201.52%200%200%200%20.642-.241c.193-.128.354-.299.47-.499l4.412-7.649a1.52%201.52%200%200%200%20.086-1.341%201.52%201.52%200%200%200-1.012-.884c-.017-.009-.019-.014-.019-.019.009-.017.014-.019.019-.019h1.87c.318%200%20.631.084.906.244s.504.388.663.664.243.588.242.907-.084.631-.243.907zm-6.239-2.721h-1.827c-.012.01-.013.014-.013.018.006.014.009.017.013.018.123.048.234.121.326.216s.163.208.207.332.061.257.049.388-.051.259-.117.373l-2.663%204.606a.92.92%200%200%201-.648.441.92.92%200%200%201-.752-.22c-.017-.008-.022-.007-.026-.004-.008.017-.007.022-.004.026l.935%201.623c.105.182.256.333.438.439s.389.161.599.161.417-.055.599-.161.333-.257.438-.439l3.484-6.022c.105-.182.16-.389.16-.599s-.055-.417-.161-.599-.257-.333-.439-.438-.389-.16-.599-.16zm-6.342%200c-.312%200-.617.092-.876.266s-.461.419-.581.708-.151.605-.09.911.211.587.431.807.501.371.807.431.623.03.911-.09.534-.321.708-.581.266-.564.266-.876c0-.207-.04-.412-.12-.604s-.195-.365-.342-.512-.32-.263-.512-.342-.396-.12-.604-.12z'%20fill='url(%23A)'/%3e%3c/g%3e%3cdefs%3e%3clinearGradient%20id='A'%20x1='19.016'%20y1='16.814'%20x2='2.55'%20y2='5.633'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%235433ff'/%3e%3cstop%20offset='.5'%20stop-color='%2320bdff'/%3e%3cstop%20offset='1'%20stop-color='%235cffa2'/%3e%3c/linearGradient%3e%3cclipPath%20id='B'%3e%3cpath%20fill='%23fff'%20d='M0%200h24v24H0z'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e",
            "decimals": 18,
            "symbol": "XVS",
          },
          "stakedToken": {
            "address": "0x5fFbE5302BadED40941A403228E6AD03f93752d9",
            "asset": "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='24'%20height='24'%20fill='none'%20xmlns:v='https://vecta.io/nano'%3e%3cg%20clip-path='url(%23B)'%3e%3cpath%20d='M12.001%2024.002c6.628%200%2012.001-5.373%2012.001-12.001S18.629%200%2012.001%200%200%205.373%200%2012.001s5.373%2012.001%2012.001%2012.001z'%20fill='url(%23A)'/%3e%3cg%20fill='%23fff'%3e%3cpath%20d='M8.114%2011.773h9.726l.656-1.416h-1.955l.013-.027%201.226-2.659c.163-.353.008-.774-.344-.934a.71.71%200%200%200-.937.344L15%2010.33l-.012.027H9.016l-.013-.027-1.499-3.25c-.163-.353-.584-.509-.937-.344a.7.7%200%200%200-.344.934l1.227%202.66.013.027H6.147l-.653%201.416h2.623-.003zM5.49%2014.599h3.926l.027.06%201.914%204.156c.116.251.367.41.64.41s.526-.159.641-.41l1.917-4.156.028-.06h3.255l.656-1.413H6.143l-.653%201.413zm7.511.06l-1.002%202.174-1.002-2.174-.027-.06h2.06l-.028.06H13z'/%3e%3c/g%3e%3c/g%3e%3cdefs%3e%3clinearGradient%20id='A'%20x1='23.695'%20y1='18.994'%20x2='-5.752'%20y2='1.282'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%235433ff'/%3e%3cstop%20offset='.5'%20stop-color='%2320bdff'/%3e%3cstop%20offset='1'%20stop-color='%235cffa2'/%3e%3c/linearGradient%3e%3cclipPath%20id='B'%3e%3cpath%20fill='%23fff'%20d='M0%200h24v24H0z'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e",
            "decimals": 18,
            "symbol": "VAI",
          },
        },
      ]
    `);

    await waitFor(() => expect(customProps.handleClose).toHaveBeenCalledTimes(1));
  });
});
