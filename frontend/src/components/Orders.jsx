import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BACKEND_BASE_URL, CHAIN_ID, TOAST_CONFIG, CONTRACT_ADDRESS } from "../utils/constants";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import truncateEthAddress from 'truncate-eth-address'
import litLib from "./../lib/lit.lib"
import orderLib from "./../lib/order.lib"
import { useEthersSigner } from "./../lib/helper.lib"
import ABI from "./../../ABI/vaultABI.json"
import { parseUnits } from "viem";

const Orders = () => {


  const { isConnected, address } = useAccount()
  const [encryptedOrder, setEncryptedOder] = useState([]);
  const signer = useEthersSigner({ chainId: CHAIN_ID });
  const {writeContractAsync} = useWriteContract()
  const publicClient = usePublicClient();

  const fetchEncrypterOrder = async () => {

    try {

      const res = await fetch(`${BACKEND_BASE_URL}/user/${address}/orders`, {

        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }

      })

      const data = await res.json();
      setEncryptedOder(data.orders)



    } catch (error) {
      toast.error("Something went wrong", TOAST_CONFIG);
      console.log(error);
    }
  }

  useEffect(() => {
    if (isConnected) {
      fetchEncrypterOrder()
    }

    return () => setEncryptedOder([])

  }, [])


  const truncateString = (str, length = 6) => {
    if (str.length <= 2 * length) {
      return str; // If the string is too short, return it as-is
    }
    const start = str.slice(0, length);
    const end = str.slice(-length);
    return `${start}…${end}`;
  }

  const handleOrderDecrypt = async () => {

    if(encryptedOrder?.[0].sourceTokenAmount){
      toast.error("Orders Already Encrypted", TOAST_CONFIG);
      return
    }

    let loader;
    try {

     
      loader = toast.loading("Decrypting your oders...", TOAST_CONFIG);

      if(encryptedOrder?.length == 0){
         toast.error("No orders to decrypt", TOAST_CONFIG);
         return;
      }
      const sessionsKey = await litLib.generateSessionSigs(signer);
      const acc =  orderLib.getOrderEncryptionAcc(address);
      const updatedOrders = await Promise.all(
        encryptedOrder.map(async (order) => {
            const decryptedDataString = await litLib.decrypt(order.ciphertext, order.dataToEncryptHash, acc, sessionsKey );
            const decryptedData = JSON.parse(decryptedDataString);
            return {
                ...order,
                ...decryptedData,
            };
        }))
      setEncryptedOder(updatedOrders)
   } catch (error) {
      toast.error("Something went wrong", TOAST_CONFIG)
      console.log(error)
    }finally{
      toast.dismiss(loader)
    }
  }

  const withdrawFundsFromVault = async (index) => {
        const order = encryptedOrder[index]
        if(!order){
          toast.error("Something went wrong" , TOAST_CONFIG);
          return;
        }

        const loader = toast.loading("Withdrawing funds from vault..." , TOAST_CONFIG);
        try{

         const hash = await writeContractAsync({
            abi: ABI,
            address: CONTRACT_ADDRESS,
            functionName: "withdraw",
            args: [order.sourceToken , parseUnits(order.sourceTokenAmount.toString(), 18)]

         })

         const receipt = await publicClient.waitForTransactionReceipt({ hash });


         if (receipt?.status !== "success") {
             throw Error("Somethong went wrong");
         }


         toast.success("Funds withdrawl from vault", TOAST_CONFIG);



        }catch(error){
          toast.error("Something went wrong" , TOAST_CONFIG);
          console.log(error)
        }finally{
          toast.dismiss(loader);
        }

        console.log(order)
  }


  if(encryptedOrder.length === 0 ){
      return <div className="flex justify-center items-center mt-10 font-bold text-2xl">
        No Order Placed yet
      </div>
  }

 return (
    <div className="flex justify-center items-center m-4 md:m-10">
      <div className="flex flex-col gap-4 bg-white rounded-3xl p-4 w-full max-w-[680px] shadow-xl">
        <div className="flex justify-between items-center p-2">
          <label className="text-sm md:text-lg font-bold pl-2">Trade History</label>
          <div className="bg-black p-2 rounded-lg flex items-center gap-2 justify-center cursor-pointer text-white md:h-12 transition-transform duration-300 ease-in-out hover:shadow-gray-800 hover:shadow-lg"
            onClick={handleOrderDecrypt}
          >Decrypt Orders</div>
        </div>


        {
          encryptedOrder.length > 0 && encryptedOrder?.[0].destTokenAmount ? 

          <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white text-xs md:text-lg md:py-2">
                <th className="px-2 py-4 border-b text-center">Source Token</th>
                <th className="px-2 py-4 border-b text-center">Destination Token</th>
                <th className="px-2 py-4 border-b text-center">Source Token Amount</th>
                <th className="px-2 py-4 border-b text-center">Source Token Amount</th>
                <th className="px-2 py-4 border-b text-center">Canel Order</th>
              </tr>
            </thead>
            <tbody>
              {encryptedOrder?.map((order, index) => (
                <tr key={index} className=" text-xs md:py-2 md:text-base">
                  <td className="px-2 py-2 border-b text-center whitespace-nowrap">{truncateEthAddress(order.sourceToken)}</td>
                  <td className="px-2 py-2 border-b text-center">{truncateEthAddress(order.destToken)}</td>
                  <td className="px-2 py-2 border-b text-center">{(order.sourceTokenAmount)}</td>
                  <td className="px-2 py-2 border-b text-center">{(order.destTokenAmount)}</td>
                  <td className="px-2 py-2 border-b text-center"><div className="bg-black text-white font-bold p-2 rounded-full cursor-pointer transition-transform duration-300 ease-in-out hover:shadow-gray-800 hover:shadow-lg text-sm"  
                   onClick={() => withdrawFundsFromVault(index)}
                  >Withdraw</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          
          
          
          
          :
     
          <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white text-xs md:text-lg md:py-2">
                <th className="px-2 py-4 border-b text-center">Source Token</th>
                <th className="px-2 py-4 border-b text-center">Destination Token</th>
                <th className="px-2 py-4 border-b text-center">Cipher Text</th>
                <th className="px-2 py-4 border-b text-center">Encypted Hash</th>
              </tr>
            </thead>
            <tbody>
              {encryptedOrder?.map((order, index) => (
                <tr key={index} className="hover:bg-gray-100 text-xs md:py-2 md:text-base">
                  <td className="px-2 py-2 border-b text-center whitespace-nowrap">{truncateEthAddress(order.sourceToken)}</td>
                  <td className="px-2 py-2 border-b text-center">{truncateEthAddress(order.destToken)}</td>
                  <td className="px-2 py-2 border-b text-center">{truncateString(order.ciphertext)}</td>
                  <td className="px-2 py-2 border-b text-center">{truncateString(order.dataToEncryptHash)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        }





      </div>
    </div>
  );
}

export default Orders