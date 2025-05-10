import { Action, HandlerCallback, IAgentRuntime, Memory, State } from '@elizaos/core';
import { fetchTransactionHistory } from '../sequenceClient.ts';

export const fetchTransactionHistoryAction: Action = {
  name: 'FETCH_TRANSACTION_HISTORY',
  similes: ['GET_TRANSACTION_HISTORY', 'RETRIEVE_TRANSACTION_HISTORY'],
  description: 'Fetches transaction history for a specified wallet address.',
  validate: async (_runtime: IAgentRuntime, message: Memory, _state: State) => {
    const rawText = message.content?.text ?? ''
    return /(0x[a-fA-F0-9]{40})/.test(rawText)
  },
  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback
  ) => {
    const rawText = message.content?.text ?? ''
    const walletRegex = /(0x[a-fA-F0-9]{40})/
    const match = rawText.match(walletRegex)
    const walletAddress = match ? match[1] : null

    if (!walletAddress) {
      callback({
        text: 'Please provide a valid wallet address.',
        content: { success: false },
      })
      return false
    }

    try {
      const result = await fetchTransactionHistory(walletAddress)

      if (!result.transactions || result.transactions.length === 0) {
        callback({
          text: `No transactions found for ${walletAddress}.`,
          content: { success: true, transactions: [] },
        })
        return true
      }

      const display = result.transactions
        .slice(0, 5) // Display up to 5 recent transactions
        .map((tx) => {
          const hash = tx.txnHash ?? 'N/A'
          const transfers = tx.transfers ?? []
          const transferDetails = transfers.map((transfer) => {
            const from = transfer.from ?? 'N/A'
            const to = transfer.to ?? 'N/A'
            const amount = transfer.amounts?.[0] ?? 'N/A'
            return `  From: ${from}\n  To: ${to}\n  Value: ${amount}`
          }).join('\n')
          return `• Hash: ${hash}\n${transferDetails}`
        })
        .join('\n\n')

      callback({
        text: `Recent transactions for ${walletAddress}:\n\n${display}`,
        content: { success: true, transactions: result.transactions },
      })
      return true
    } catch (error) {
      console.error('Error fetching transaction history:', error)
      callback({
        text: 'An error occurred while fetching transaction history.',
        content: { success: false },
      })
      return false
    }
  },
  examples: [
    [
      { user: '{{user1}}', content: { text: '0x1234...abcd' } },
      {
        user: '{{user1}}',
        content: {
          text: 'Recent transactions for 0x1234...abcd:\n• Hash: 0xabc123...\n  From: 0xfrom...\n  To: 0xto...\n  Value: 1.5 ETH',
        },
      },
    ],
  ],
}
