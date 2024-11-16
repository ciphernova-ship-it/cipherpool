import { useAccount } from "wagmi"
import Logo from "./../../public/assets/Logo.svg"
import { Link } from "react-router-dom"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import CustomWalletButton from "./CustomWalletButton"
import { useEffect } from "react"
import litLib from "./../lib/lit.lib"




const Header = () => {


    const { isConnected } = useAccount()


    const connectLibClient = async () => {
        try {

            await litLib.connect();

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {

        if (isConnected) { connectLibClient() }

    }, [isConnected])







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

                <ConnectButton chainStatus={{ smallScreen: "icon", largeScreen: "full" }} accountStatus={{ smallScreen: "icon", largeScreen: "full" }} />
                :
                <CustomWalletButton />
        }



    </div>

}

export default Header