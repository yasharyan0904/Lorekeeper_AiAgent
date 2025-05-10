// src/plugins/sequencePlugin.ts
import { Plugin } from '@elizaos/core';
import { fetchTokenBalancesAction } from '../actions/fetchTokenBalances.ts';
import {fetchTransactionHistoryAction} from '../actions/fetchTransactionHistory.ts';
import {fetchNFTMetadataAction} from '../actions/fetchMetadata.ts';

export const sequencePlugin: Plugin = {
  name: 'sequencePlugin',
  actions: [fetchTokenBalancesAction,fetchTransactionHistoryAction,fetchNFTMetadataAction],
  description:"token balance and NFT metadata",
  // Add providers or evaluators if needed
};