import { t } from 'libs/translations';

export const unexpectedErrorPhrases = {
  somethingWentWrong: t('errors.somethingWentWrong'),
  somethingWentWrongRetrievingTransactions: t('errors.somethingWentWrongRetrievingTransactions'),
  somethingWentWrongRetrievingVoterAccounts: t('errors.somethingWentWrongRetrievingVoterAccounts'),
  somethingWentWrongRetrievingVoterDetails: t('errors.somethingWentWrongRetrievingVoterDetails'),
  somethingWentWrongRetrievingVoterHistory: t('errors.somethingWentWrongRetrievingVoterHistory'),
  couldNotRetrieveSigner: t('errors.couldNotRetrieveSigner'),
  missingSafeWalletApiUrl: t('errors.missingSafeWalletApiUrl'),
  couldNotSwitchChain: t('errors.couldNotSwitchChain'),
  walletNotConnected: t('errors.walletNotConnected'),
  undefinedAccountErrorMessage: t('errors.undefinedAccountErrorMessage'),
  accountError: t('markets.errors.accountError'),
  incorrectSwapInput: t('swap.errors.incorrectSwapInput'),
  gaslessTransactionNotAvailable: t('transactionErrors.gaslessTransactionNotAvailable'),
  gasEstimationFailed: t('transactionErrors.gasEstimationFailed'),
};
