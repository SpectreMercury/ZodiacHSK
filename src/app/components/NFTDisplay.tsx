/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount, useContractRead, useContractReads } from 'wagmi';
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

  const { data: userNFTs, isError: isNFTsError, error: nftsError } = useContractRead({
    address: ZODIAC_TRADING_ADDRESS as Address,
    abi: ZODIAC_TRADING_ABI as Abi,
    functionName: 'getUserNFTs',
    args: [address],
  });

  const tokenURIContracts = useMemo(() => {
    if (!userNFTs) return [];
    return (userNFTs as bigint[]).map((tokenId) => ({
      address: ZODIAC_NFT_ADDRESS as Address,
      abi: ZODIAC_NFT_ABI as Abi,
      functionName: 'tokenURI',
      args: [tokenId.toString()], // 将 BigInt 转换为字符串
    }));
  }, [userNFTs]);

  const { data: tokenURIData, isError: isTokenURIError, error: tokenURIError } = useContractReads({
    contracts: tokenURIContracts,
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
    if (isNFTsError || isTokenURIError) {
      setError(`获取数据时出错: ${nftsError?.message || tokenURIError?.message}`);
      return;
    }

    if (userNFTs && tokenURIData) {
      const nftData = (userNFTs as bigint[]).map((tokenId, index) => {
        const uriResult = tokenURIData[index];
        if (!uriResult.result || uriResult.status !== 'success') return null;
        try {
          const metadata = parseMetadata(uriResult.result as string);
          return { id: tokenId.toString(), metadata };
        } catch (error) {
          console.error('解析 NFT 元数据时出错:', error);
          return null;
        }
      }).filter((item): item is NFTData => item !== null);

      setNfts(nftData);
      console.log('Set NFTs:', nftData);
    }
  }, [userNFTs, tokenURIData, isNFTsError, isTokenURIError, nftsError, tokenURIError, parseMetadata]);

  if (error) {
    return <div className="mt-8 text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">您的 NFT 收藏</h2>
      {nfts.length === 0 ? (
        <p className="text-center text-xl sm:text-2xl text-gray-300">您还没有任何 NFT</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {nfts.map((nft) => (
            <div key={nft.id} className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg transform transition duration-300 hover:scale-105">
              <div className="relative pb-[100%]">
                {nft.metadata.image && (
                  <img src={nft.metadata.image} alt={`NFT #${nft.id}`} className="absolute inset-0 w-full h-full object-cover" />
                )}
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">NFT #{nft.id}</h3>
                <p className="text-lg text-gray-300 mb-2"><strong>名称:</strong> {nft.metadata.name}</p>
                <p className="text-lg text-gray-300"><strong>描述:</strong> {nft.metadata.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
