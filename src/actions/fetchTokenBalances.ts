import { Action, HandlerCallback, IAgentRuntime, Memory, State } from '@elizaos/core';
import { fetchTokenBalances } from '../sequenceClient.ts';


export const fetchTokenBalancesAction: Action = {
    name: 'FETCH_TOKEN_BALANCES',
    similes: ['GET_TOKEN_BALANCES', 'RETRIEVE_TOKEN_BALANCES'],
    description: 'Fetches token balances for a specified wallet address.',
    //validate: async (_runtime: IAgentRuntime, _message: Memory, _state: State) => {
    //  return true;
    //},
    validate: async (_runtime: IAgentRuntime, message: Memory, _state: State) => {
        const rawText = message.content?.text ?? '';
        return /(0x[a-fA-F0-9]{40})/.test(rawText);
    },      
    handler: async (
      _runtime: IAgentRuntime,
      message: Memory,
      _state: State,
      _options: any,
      callback: HandlerCallback
    ) => {
      //const walletAddress = message.content?.text?.trim();
      const rawText = message.content?.text ?? '';
      const walletRegex = /(0x[a-fA-F0-9]{40})/;
      const match = rawText.match(walletRegex);
      const walletAddress = match ? match[1] : null;
      if (!walletAddress) {
        callback({
          text: 'Please provide a valid wallet address.',
          content: { success: false },
        });
        return false;
      }
  
      try {
        const result = await fetchTokenBalances(walletAddress);
  
        const display = result.balances
          .map((b) => {
            const symbol = b.contractInfo?.symbol ?? 'UNKNOWN';
            const amount = b.balance;
            return `• ${amount} ${symbol}`;
          })
          .join('\n');
  
        callback({
          text: `Token balances for ${walletAddress}:\n${display}`,
          content: { success: true, balances: result.balances },
        });
        return true;
      } catch (error) {
        console.error('Error fetching balances:', error);
        callback({
          text: 'An error occurred while fetching token balances.',
          content: { success: false },
        });
        return false;
      }
    },
    examples: [
      [
        { user: '{{user1}}', content: { text: '0x1234...abcd' } },
        {
          user: '{{user1}}',
          content: {
            text: 'Token balances for 0x1234...abcd:\n• 5000 XYZ',
          },
        },
      ],
    ],
  };