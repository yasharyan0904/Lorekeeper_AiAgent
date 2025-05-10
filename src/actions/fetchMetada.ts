import { Action, HandlerCallback, IAgentRuntime, Memory, State } from '@elizaos/core';
import { fetchContractMetadata } from '../sequenceClient.ts';

interface TokenMetadata {
  chainId?: number;
  contractAddress?: string;
  tokenId: string;
  source: string;
  name: string;
  description?: string;
  image?: string;
  video?: string;
  audio?: string;
  properties?: { [key: string]: any };
  attributes: Array<{ [key: string]: any }>;
  image_data?: string;
  external_url?: string;
  background_color?: string;
  animation_url?: string;
  decimals?: number;
  updatedAt?: string;
  assets?: Array<any>; // Replace 'any' with the actual Asset type if available
  status: string; // Replace with 'ResourceStatus' enum if defined
  queuedAt?: string;
  lastFetched?: string;
}

export const fetchNFTMetadataAction: Action = {
  name: 'FETCH_NFT_METADATA',
  similes: ['GET_NFT_METADATA', 'RETRIEVE_NFT_METADATA'],
  description: 'Fetches NFT metadata for a specified contract address and token ID.',
  validate: async (_runtime: IAgentRuntime, message: Memory, _state: State) => {
    const rawText = message.content?.text ?? '';
    const contractRegex = /(0x[a-fA-F0-9]{40})/;
    const tokenIdRegex = /\b\d+\b/;
    return contractRegex.test(rawText) && tokenIdRegex.test(rawText);
  },
  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback
  ) => {
    const rawText = message.content?.text ?? '';
    const contractRegex = /(0x[a-fA-F0-9]{40})/;
    const tokenIdRegex = /\b\d+\b/;

    const contractMatch = rawText.match(contractRegex);
    const tokenIdMatch = rawText.match(tokenIdRegex);

    const contractAddress = contractMatch ? contractMatch[1] : null;
    const tokenId = tokenIdMatch ? tokenIdMatch[0] : null;

    if (!contractAddress || !tokenId) {
      callback({
        text: 'Please provide a valid contract address and token ID.',
        content: { success: false },
      });
      return false;
    }

    try {
        const metadataResponse = await fetchContractMetadata('1946', contractAddress, tokenId);


      if (
        !metadataResponse ||
        !metadataResponse.tokenMetadata ||
        metadataResponse.tokenMetadata.length === 0
      ) {
        callback({
          text: `No metadata found for token ID ${tokenId} at contract ${contractAddress}.`,
          content: { success: true, metadata: null },
        });
        return true;
      }

      const nft: TokenMetadata = metadataResponse.tokenMetadata[0];
      const attributes = nft.attributes
        ? nft.attributes
            .map((attr) => {
              const entries = Object.entries(attr);
              return entries.map(([key, value]) => `${key}: ${value}`).join(', ');
            })
            .join('; ')
        : 'No attributes available';

      const display = `Name: ${nft.name || 'N/A'}
Description: ${nft.description || 'N/A'}
Image URL: ${nft.image || 'N/A'}
Attributes: ${attributes}`;

      callback({
        text: `Metadata for token ID ${tokenId} at contract ${contractAddress}:\n\n${display}`,
        content: { success: true, metadata: nft },
      });
      return true;
    } catch (error) {
      console.error('Error fetching NFT metadata:', error);
      callback({
        text: 'An error occurred while fetching NFT metadata.',
        content: { success: false },
      });
      return false;
    }
  },
  examples: [
    [
      { user: '{{user1}}', content: { text: '0x0adeDa6DD4461e0270F9539cad80a73A9B125587 1' } },
      {
        user: '{{user1}}',
        content: {
          text: 'Metadata for token ID 1 at contract 0x0adeDa6DD4461e0270F9539cad80a73A9B125587:\n\nName: PUG\nDescription: An adorable PUG pup!\nImage URL: https://ipfs.sequence.info/ipfs/QmSsYRx3LpDAb1GZQm7zZ1AuHZjfbPkD6J7s9r41xu1mf8?filename=pug.png\nAttributes: Breed: Pug, Mood: Happy',
        },
      },
    ],
  ],
};
