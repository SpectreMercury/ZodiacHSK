'use client';

import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
import { ZODIAC_TRADING_ABI, ZODIAC_TRADING_ADDRESS, ZODIAC_NFT_ADDRESS, ZODIAC_NFT_ABI } from '@/constants/constants';
import { useAccount, useWriteContract, useWatchContractEvent, useReadContract } from 'wagmi';
import NFTDisplay from './NFTDisplay';

export default function MintNFT() {
  const { isConnected, address } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  const [nftBalance, setNftBalance] = useState('0');
  const { writeContract, isPending, isSuccess, isError } = useWriteContract();

  const { data: balanceData } = useReadContract({
    address: ZODIAC_NFT_ADDRESS,
    abi: ZODIAC_NFT_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  useEffect(() => {
    if (balanceData) {
      setNftBalance(balanceData.toString());
    }
  }, [balanceData]);

  useWatchContractEvent({
    address: ZODIAC_NFT_ADDRESS,
    abi: ZODIAC_NFT_ABI,
    eventName: 'Transfer',
    onLogs: async () => {
      refetchBalance()
    },
  });

  const handleMint = async () => {
    if (!isConnected || !address) {
      alert('请先连接你的钱包');
      return;
    }

    setIsMinting(true);
    try {
      await writeContract({
        address: ZODIAC_TRADING_ADDRESS,
        abi: ZODIAC_TRADING_ABI,
        functionName: 'mint',
        args: [],
        value: parseEther('0.1'),
      });
    } catch (error) {
      console.error('铸造 NFT 时出错:', error);
      alert('铸造 NFT 时出错。请查看控制台以获取详细信息。');
      setIsMinting(false);
    }
  };

  const { refetch: refetchBalance } = useReadContract({
    address: ZODIAC_NFT_ADDRESS,
    abi: ZODIAC_NFT_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  useEffect(() => {
    if (isSuccess) {
      alert('NFT 铸造成功！');
      setIsMinting(false);
      refetchBalance();
    }
    if (isError) {
      alert('NFT 铸造失败。请查看控制台以获取详细信息。');
      setIsMinting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isError, refetchBalance]);

  return (
    <div>
      <div className="flex justify-end mb-8">
        <ConnectButton />
      </div>
      {isConnected && address ? (
        <div className="mb-8 bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg">
          <p className="mb-2 text-lg">当前连接地址: <span className="font-mono text-sm">{address}</span></p>
          <p className="mb-4 text-xl">您当前持有的 NFT 数量: <span className="font-bold text-2xl">{nftBalance}</span></p>
          <button 
            className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            onClick={handleMint} 
            disabled={isMinting || isPending}
          >
            {isMinting || isPending ? '铸造中...' : '铸造 NFT (0.1 POL)'}
          </button>
          {isSuccess && <div className="mt-4 text-green-400 font-semibold">NFT 铸造成功！</div>}
          {isError && <div className="mt-4 text-red-400 font-semibold">铸造失败，请重试。</div>}
        </div>
      ) : (
        <p className="mb-8 text-xl text-center">请连接钱包以铸造 NFT</p>
      )}
      <NFTDisplay />
    </div>
  );
}