/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useContractReads } from 'wagmi';
import { Abi, Address } from 'viem';
import { ZODIAC_NFT_ADDRESS, ZODIAC_NFT_ABI, ZODIAC_TRADING_ADDRESS, ZODIAC_TRADING_ABI } from '@/constants/constants';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
}

interface NFTData {
  id: string;
  metadata: NFTMetadata;
}

export default function NFTDisplay() {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: collectionData, isError, error: contractError } = useContractReads({
    contracts: [
      {
        address: ZODIAC_NFT_ADDRESS as Address,
        abi: ZODIAC_NFT_ABI as Abi,
        functionName: 'balanceOf',
        args: [address as Address],
      },
      ...Array(12).fill(0).map((_, i) => ({
        address: ZODIAC_TRADING_ADDRESS as Address,
        abi: ZODIAC_TRADING_ABI as Abi,
        functionName: 'userZodiacCollection',
        args: [address as Address, i.toString()],
      })),
    ],
  });

  const tokenIds = collectionData?.slice(1)
    .map(item => item.result)
    .filter(id => id && typeof id === 'bigint' && id !== BigInt(0))
    .map(id => id!.toString());

  const { data: tokenURIs } = useContractReads({
    contracts: tokenIds?.map(id => ({
      address: ZODIAC_NFT_ADDRESS as Address,
      abi: ZODIAC_NFT_ABI as Abi,
      functionName: 'tokenURI',
      args: [id],
    })) ?? [],
  });

  const parseMetadata = useCallback((tokenURI: string): NFTMetadata => {
    if (tokenURI.startsWith('data:application/json;base64,')) {
      const base64 = tokenURI.split(',')[1];
      const decodedData = atob(base64);
      return JSON.parse(decodedData);
    } else {
      return JSON.parse(tokenURI);
    }
  }, []);

  useEffect(() => {
    if (isError) {
      setError(`获取数据时出错: ${contractError?.message}`);
      return;
    }

    if (!tokenURIs) return;

    const nftData: NFTData[] = tokenURIs
      .map((uriResult, index) => {
        if (!uriResult.result) return null;
        try {
          const metadata = parseMetadata(uriResult.result as string);
          return { id: tokenIds![index], metadata };
        } catch (error) {
          console.error('Error parsing NFT metadata:', error);
          return null;
        }
      })
      .filter((item): item is NFTData => item !== null);

    setNfts(nftData);
  }, [tokenURIs, tokenIds, isError, contractError, parseMetadata]);

  if (error) {
    return <div className="mt-8 text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">您的 NFT 收藏</h2>
      {nfts.length === 0 ? (
        <p className="text-center text-xl text-gray-300">您还没有任何 NFT</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {nfts.map((nft) => (
            <div key={nft.id} className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105">
              <div className="relative pb-[100%]">
                {nft.metadata.image && (
                  <img src={nft.metadata.image} alt={`NFT #${nft.id}`} className="absolute inset-0 w-full h-full object-cover" />
                )}
              </div>
              <div className="p-3">
                <h3 className="text-lg font-semibold mb-1">NFT #{nft.id}</h3>
                <p className="text-sm text-gray-300"><strong>名称:</strong> {nft.metadata.name}</p>
                <p className="text-sm text-gray-300 mt-1 truncate"><strong>描述:</strong> {nft.metadata.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}