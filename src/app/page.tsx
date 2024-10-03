'use client';

import MintNFT from "./components/MintNFT";
import PixelatedTitle from "./components/PixelatedTitle";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <PixelatedTitle />
        <h2 className="text-3xl font-semibold text-center mb-12">铸造你的生肖 NFT</h2>
        <MintNFT />
      </div>
    </div>
  );
}