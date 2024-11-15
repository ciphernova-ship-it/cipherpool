import { toast } from "react-toastify";
import downArrow from "./../../public/assets/dowmArrow.svg";
import ethLogo from "./../../public/assets/ethLogo.svg";
import tetherLogo from "./../../public/assets/tether.svg";
import { useState } from "react";
import { TOAST_CONFIG, BACKEND_BASE_URL} from "./../utils/constants"
import { useAccount } from "wagmi"
import CustomWalletButton from "./CustomWalletButton";
import orderLib from "./../lib/order.lib"


const SwapComponent = () => {
    const tokens = [
        { id: 1, name: 'Ethereum', symbol: 'ETH', logo: ethLogo, address : "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" },
        { id: 2, name: 'Tether', symbol: 'USDT', logo: tetherLogo, address : "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" },
    ];

     const {isConnected , address} = useAccount()

    const [isToken0SelectModal, setIsToken0SelectModal] = useState(false);
    const [isToken1SelectModal, setIsToken1SelectModal] = useState(false);
    const [selectedToken1, setSelectedToken1] = useState(tokens[0]);
    const [selectedToken2, setSelectedToken2] = useState(tokens[1]);
    const [tokenSellPrice, setTokenSellPrice] = useState("")
    const [tokenSellQuantity, setTokenSellQuantity] = useState("")




    const handleToken1ModalClick = (index) => {
        setSelectedToken1(tokens[index]);
        setIsToken0SelectModal(false);
    };
    const handleToken2ModalClick = (index) => {
        setSelectedToken2(tokens[index]);
        setIsToken1SelectModal(false);
    };

    const handleOrderCreation = async ()=>{

        if(tokenSellPrice === "" || tokenSellQuantity === "" || parseFloat(tokenSellPrice) <= 0 || parseFloat(tokenSellQuantity) <= 0 ){
            toast.error("Invalid order params", TOAST_CONFIG);
            return;
        }

        if(selectedToken1.symbol === selectedToken2.symbol){
            toast.error("Cannot buy/sell for same tokens", TOAST_CONFIG);
            return;
        }

        let loderToast;

        try {

         loderToast =  toast.loading(`Placing order`, TOAST_CONFIG);

         const orderData = {
            sourceToken: selectedToken1.address,
            destinationToken: selectedToken2.address,
            quantity: tokenSellPrice,
            price: tokenSellQuantity,
            maker : address
        };

        const {ciphertext,dataToEncryptHash} = await orderLib.encryptOrder(orderData.sourceToken, orderData.destinationToken, orderData.quantity, orderData.quantity * orderData.price, orderData.maker)
        
        const response = await fetch( `${BACKEND_BASE_URL}/order/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sourceToken: orderData.sourceToken,
                destToken: orderData.destinationToken,
                maker: orderData.maker,
                ciphertext,
                dataToEncryptHash

            })
        })


         // store the funds in the vault

         // Make the API Call to create the order
        console.log(response)


        // Success
        toast.success('Order placed' , TOAST_CONFIG)

        }catch(error){
            console.log(error);
            toast.error('Something went wrong!' , TOAST_CONFIG)

        }finally{
            setTokenSellPrice("")
            setTokenSellQuantity("")
            toast.dismiss(loderToast);
        }
    }

    return (
        <div className="m-10 flex justify-center items-center">
            <div className="flex flex-col gap-4 bg-white rounded-3xl p-4 md:p-8 md:w-[580px] shadow-xl">
                <div>
                    <label className="text-xs md:text-lg font-bold pl-2">Swap</label>
                    <div className="flex justify-between border-[1.5px] w-full rounded-lg p-2">
                        <input
                            className="p-1 outline-none w-1/2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            type="number"
                            placeholder="0.00"
                            value={tokenSellQuantity}
                            onChange={(e)=> setTokenSellQuantity(e.target.value)}
                        />
                        <div
                            className="flex gap-2 justify-center items-center bg-black text-white text-center rounded-3xl px-4 py-2 cursor-pointer"
                            onClick={() => setIsToken0SelectModal(true)}
                        >
                            <img src={selectedToken1.logo} className="h-10 w-10" />
                            <div className="">{selectedToken1.symbol}</div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold pl-2 md:text-lg">At price</label>
                    <div className="flex justify-between border-[1.5px] w-full rounded-lg p-2">
                        <input
                         className="p-1 outline-none w-1/2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                         type="number"
                         placeholder="0.00"
                         value={tokenSellPrice}
                         onChange={(e)=> setTokenSellPrice(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-center items-center">
                    <img src={downArrow} />
                </div>

                <div>
                    <label className="text-xs font-bold pl-2 md:text-lg"> Will receive</label>
                    <div className="flex justify-between border-[1.5px] w-full rounded-lg p-2">
                        <div
                            className="p-1 outline-none w-1/2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-2xl"
                        >
                            {(tokenSellPrice === "" || tokenSellQuantity === "") ? 0 : parseFloat(tokenSellPrice) * parseFloat(tokenSellQuantity)}
                        </div>
                        <div
                            className="flex gap-2 justify-center items-center bg-black text-white text-center rounded-3xl px-4 py-2 cursor-pointer"
                            onClick={() => setIsToken1SelectModal(true)}
                        >
                            <img src={selectedToken2.logo} className="h-10 w-10" />
                            <div className="">{selectedToken2.symbol}</div>
                        </div>
                    </div>
                </div>

          {
            isConnected ?
              <div
                className="bg-black p-2 rounded-lg flex items-center gap-2 justify-center cursor-pointer text-white md:h-12 transition-transform duration-300 ease-in-out hover:shadow-gray-800 hover:shadow-lg"
                onClick={handleOrderCreation}
              >
                <div className="w-full text-center">Create Order</div>
              </div>
              :
              <CustomWalletButton />
          }


            </div>

            {isToken0SelectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4">
                    <div className="bg-gray-100 rounded-2xl w-full max-w-md text-white">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-black">Select a token</h2>
                                <button
                                    onClick={() => setIsToken0SelectModal(false)}
                                    className="p-1 hover:bg-gray-800 rounded-lg"
                                >
                                    <span className="block w-6 h-6 text-center leading-6 text-black hover:text-white">×</span>
                                </button>
                            </div>

                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Search or Enter Token Address"
                                    className="w-full bg-gray-500 rounded-xl py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="absolute inset-y-0 left-3 flex items-center">
                                    <svg
                                        className="w-4 h-4 text-gray-400"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="M21 21l-4.35-4.35" />
                                    </svg>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-sm text-black font-bold mb-2">Tokens</h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {tokens.map((token, index) => (
                                        <div
                                            key={token.id}
                                            className="flex items-center justify-between p-2 hover:bg-gray-800 rounded-xl cursor-pointer"
                                            onClick={() => handleToken1ModalClick(index)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                                    <img src={token.logo} />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">{token.symbol}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isToken1SelectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4">
                    <div className="bg-gray-100 rounded-2xl w-full max-w-md text-white">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-black">Select a token</h2>
                                <button
                                    onClick={() => setIsToken1SelectModal(false)}
                                    className="p-1 hover:bg-gray-800 rounded-lg"
                                >
                                    <span className="block w-6 h-6 text-center leading-6 text-black hover:text-white">×</span>
                                </button>
                            </div>

                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Search or Enter Token Address"
                                    className="w-full bg-gray-500 rounded-xl py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="absolute inset-y-0 left-3 flex items-center">
                                    <svg
                                        className="w-4 h-4 text-gray-400"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="M21 21l-4.35-4.35" />
                                    </svg>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-sm text-black font-bold mb-2">Tokens</h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {tokens.map((token, index) => (
                                        <div
                                            key={token.id}
                                            className="flex items-center justify-between p-2 hover:bg-gray-800 rounded-xl cursor-pointer"
                                            onClick={() => handleToken2ModalClick(index)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                                    <img src={token.logo} />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">{token.symbol}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SwapComponent;
