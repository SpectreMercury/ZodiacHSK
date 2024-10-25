"use client";

import "@rainbow-me/rainbowkit/styles.css";
import * as React from "react";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  WagmiProvider,
  cookieStorage,
  createStorage,
} from "wagmi";
import { Chain } from 'wagmi/chains';

// 定义 Polygon Amoy 测试网
const HashkeyTestnet: Chain = {
  id: 133,
  name: 'HashKey Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HSK',
    symbol: 'HSK',
  },
  rpcUrls: {
    public: { http: ['https://hashkeychain-testnet.alt.technology'] },
    default: { http: ['https://hashkeychain-testnet.alt.technology'] },
  },
  blockExplorers: {
    default: { name: 'HashKey Chain Testnet Explorer', url: 'https://hashkeychain-testnet-explorer.alt.technology' },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: "Zodiac NFT",
  projectId: "6b4643484902a88bd040d924e58d95dc", // 请确保这是一个有效的 WalletConnect projectId
  chains: [HashkeyTestnet],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

const queryClient = new QueryClient();

export function RainbowConnector({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}