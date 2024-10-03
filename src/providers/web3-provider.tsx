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
const polygonAmoy: Chain = {
  id: 80_002,
  name: 'Polygon Amoy',
  nativeCurrency: {
    decimals: 18,
    name: 'Polygon',
    symbol: 'MATIC',
  },
  rpcUrls: {
    public: { http: ['https://rpc-amoy.polygon.technology'] },
    default: { http: ['https://rpc-amoy.polygon.technology'] },
  },
  blockExplorers: {
    default: { name: 'PolygonScan', url: 'https://amoy.polygonscan.com' },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: "Zodiac NFT",
  projectId: "6b4643484902a88bd040d924e58d95dc", // 请确保这是一个有效的 WalletConnect projectId
  chains: [polygonAmoy],
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