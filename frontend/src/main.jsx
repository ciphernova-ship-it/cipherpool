import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import '@rainbow-me/rainbowkit/styles.css';
import { ToastContainer } from 'react-toastify';

import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  sepolia,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import 'react-toastify/dist/ReactToastify.css';

const config = getDefaultConfig({
  appName: 'Cipherpool',
  projectId: 'b534a3a93b66b9fccda2a2f70d875708',
  chains: [ sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
    <ToastContainer />
  </StrictMode>,
)
