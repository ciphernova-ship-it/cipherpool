import Header from "./components/Header"
import Orders from "./components/Orders";
import SwapCompnent from "./components/SwapComponent"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CONTRACT_ADDRESS, TOAST_CONFIG, BASE_SCANNER_URL } from "./utils/constants"
import ABI from "./../ABI/vaultABI.json"
import { toast } from "react-toastify"
import truncateEthAddress from "truncate-eth-address"
import { useAccount, useWatchContractEvent } from "wagmi"
import { useState, useRef } from "react";

function App() {
  const [txHash, setTxHash] = useState(null);
  const { address } = useAccount();
  const lastProcessedTx = useRef(null);

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    eventName: 'OrderSettled',
    onLogs(logs) {
      const currentTxHash = logs[0]?.transactionHash;
      
      // Only process if it's a new transaction
      if (currentTxHash && lastProcessedTx.current !== currentTxHash) {
        lastProcessedTx.current = currentTxHash;
        setTxHash(currentTxHash);
        
        if (logs[0]?.args?._user1?.toLowerCase() === address?.toLowerCase() || 
            logs[0]?.args?._user2?.toLowerCase() === address?.toLowerCase()) {
          toast.success("Order executed...", TOAST_CONFIG);
        }
      }
    },
  });

  return (
    <div className="bg-gray-300 min-h-screen flex flex-col">
      <Router>
        <Header />
        {txHash && (
          <div className="font-bold hover:underline text-center">
            <a href={`${BASE_SCANNER_URL}${txHash}`} target="_blank" rel="noopener noreferrer">
              Settlement tx hash: {truncateEthAddress(txHash)}
            </a>
          </div>
        )}
        <Routes>
          <Route path="/" element={<SwapCompnent />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App