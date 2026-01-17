import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'

export const anvil = defineChain({
  id: 31337,
  name: 'Local Chain',
  nativeCurrency: { name: 'GDG', symbol: 'GDG', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] }
  }
})

export const config = createConfig({
  chains: [anvil],
  transports: {
    [anvil.id]: http(),
  },
})
