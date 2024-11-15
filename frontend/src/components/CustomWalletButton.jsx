import walletLogo from "./../../public/assets/wallet.svg"
import { useConnectModal } from '@rainbow-me/rainbowkit';


const CustomWalletButton = () => {

    const { openConnectModal } = useConnectModal();
  return (
    <div
    className="bg-black p-2 md:p-4 rounded-lg flex items-center gap-2 justify-center cursor-pointer text-white md:h-12 transition-transform duration-300 ease-in-out hover:shadow-gray-800 hover:shadow-lg hover:scale-105"
    onClick={openConnectModal}
    >
    <img src={walletLogo} className="h-6 w-6 md:h-8 md:w-8 transition-transform duration-300 ease-in-out hover:scale-110" />
    <div className="text-white font-semibold transition-transform duration-300 ease-in-out text-xs md:text-xl">Connect Wallet</div>
    </div>
  )
}

export default CustomWalletButton