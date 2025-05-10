import { SequenceIndexer } from '@0xsequence/indexer';
import { SequenceMetadata } from '@0xsequence/metadata';

const client = new SequenceIndexer("https://soneium-minato-indexer.sequence.app", "");
const metadataClient= new SequenceMetadata("https://metadata.sequence.app","");

export async function fetchTokenBalances(address: string) {
    // const response = await client.getTokenBalances({
    //   accountAddress: address,
    //   includeMetadata: true,
    // });
    // return response;
    try {
        const result = await client.getTokenBalances({
          accountAddress: address,
          includeMetadata: true,
        });
        return result;
      } catch (err) {
        console.error('Error fetching token balances:', err);
        throw err;
      }
  }  

  export async function fetchTransactionHistory(address: string) {
    try {
      const filter = { accountAddress: address }
      const transactionHistory = await client.getTransactionHistory({
        filter,
        includeMetadata: true
      })
      console.log('Transaction history for account:', transactionHistory)
      return transactionHistory
    } catch (error) {
      console.error('Error fetching transaction history:', error)
      throw error
    }
  }

  export async function fetchContractMetadata(chainId: string, contractAddress: string, tokenId: string) {
    try {
      const result = await metadataClient.getTokenMetadata({
        chainID: chainId,
        contractAddress,
        tokenIDs: [tokenId],
      });
      return result;
    } catch (err) {
      console.error('Error fetching token metadata:', err);
      throw err;
    }
  }
  
 