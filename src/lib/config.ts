export type NetworkName = 'testnet' | 'mainnet';

export interface TokenInfo {
  code: 'XLM' | 'USDC';
  contractId: string;
}

const env = (v: string | undefined, fallback: string) => (v && v.trim() ? v.trim() : fallback);

const network = env(process.env.NEXT_PUBLIC_STELLAR_NETWORK, 'testnet') as NetworkName;

// Defaults are the public testnet deployment from settlix-contracts/deployments/testnet.json.
export const config = {
  network,
  networkPassphrase:
    network === 'mainnet' ? 'Public Global Stellar Network ; September 2015' : 'Test SDF Network ; September 2015',
  rpcUrl: env(process.env.NEXT_PUBLIC_SOROBAN_RPC_URL, 'https://soroban-testnet.stellar.org'),
  oracleUrl: env(process.env.NEXT_PUBLIC_ORACLE_URL, 'http://localhost:3001'),
  explorer: `https://stellar.expert/explorer/${network === 'mainnet' ? 'public' : 'testnet'}`,
  contracts: {
    registry: env(process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ID, 'CD4ZYA3CYCSFBWOEDX3S4QUGAC3FBCHYPS7UN25MGEOQVB5JIAPQJJLP'),
    payment: env(process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ID, 'CBT5VKCQXUGQ3JXBJOQXJPRWXWGBWFAQ5UZ3S4V66H7W7IWRUSPZ7IUQ'),
    settlement: env(process.env.NEXT_PUBLIC_SETTLEMENT_CONTRACT_ID, 'CAUKU4RFZXVXZW6ED6DR5BRWAHFHPUH662IGPEZF7SO553XXWFQBCFEV'),
  },
  tokens: [
    { code: 'XLM', contractId: env(process.env.NEXT_PUBLIC_XLM_CONTRACT_ID, 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC') },
    { code: 'USDC', contractId: env(process.env.NEXT_PUBLIC_USDC_CONTRACT_ID, 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA') },
  ] as TokenInfo[],
};

export const tokenByContract = (id: string) => config.tokens.find((t) => t.contractId === id);
export const tokenByCode = (code: string) => config.tokens.find((t) => t.code === code);
