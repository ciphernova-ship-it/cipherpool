import { useAccount } from "wagmi"
import Logo from "./../../public/assets/Logo.svg"
import walletLogo from "./../../public/assets/wallet.svg"
import { Link } from "react-router-dom"
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit"


const Header = () => {


    const{isConnected}= useAccount()
    const { openConnectModal } = useConnectModal();


    return <div className="flex justify-between items-center p-6" >
        <div className="flex md:gap-4">
            <Link to={"/"}><img src={Logo} className="h-11 w-11 md:h-16 md:w-16 transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer" /></Link>

            <div className="flex gap-1 md:gap-6 items-center cursor-pointer justify-center">
                <Link to={"/"} className="transition-all duration-300 ease-in-out hover:text-gray-700 hover:scale-105">
                    <div className="text-black font-bold text-lg md:text-2xl">Swap</div>
                </Link>
                <Link to={"/orders"} className="transition-all duration-300 ease-in-out hover:text-gray-700 hover:scale-105">
                    <div className="text-black font-bold text-lg md:text-2xl">Orders</div>
                </Link>
            </div>

        </div>

        {
                isConnected ? 
                
                <ConnectButton chainStatus={{smallScreen: "icon", largeScreen: "full"}} accountStatus={{smallScreen: "icon", largeScreen: "full"}}/>
                :
                <div
                    className="bg-black p-2 md:p-4 rounded-lg flex items-center gap-2 justify-center cursor-pointer text-white md:h-12 transition-transform duration-300 ease-in-out hover:shadow-gray-800 hover:shadow-lg hover:scale-105"
                    onClick={openConnectModal}
                >
                    <img src={walletLogo} className="h-6 w-6 md:h-8 md:w-8 transition-transform duration-300 ease-in-out hover:scale-110" />
                    <div className="text-white font-semibold transition-transform duration-300 ease-in-out text-xs md:text-xl">Connect Wallet</div>
                </div>
        }



           </div>

}

export default Header