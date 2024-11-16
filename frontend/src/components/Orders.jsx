import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BACKEND_BASE_URL, TOAST_CONFIG } from "../utils/constants";
import { useAccount } from "wagmi";
import truncateEthAddress from 'truncate-eth-address'
import litLib from "./../lib/lit.lib"


const Orders = () => {


  const { isConnected, address } = useAccount()
  const [encryptedOrder, setEncryptedOder] = useState([]);


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
    try {


      // console.log(walletClient?.data)
      // const res = await litLib.generateSessionSigs(walletClient?.data);
      // console.log(res);

    } catch (error) {
      toast.error("Something went wrong", TOAST_CONFIG)
      console.log(error)
    }
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
                  <td className="px-2 py-2 border-b text-center whitespace-nowrap cursor-pointe">{truncateEthAddress(order.sourceToken)}</td>
                  <td className="px-2 py-2 border-b text-center">{truncateEthAddress(order.destToken)}</td>
                  <td className="px-2 py-2 border-b text-center">{truncateString(order.ciphertext)}</td>
                  <td className="px-2 py-2 border-b text-center">{truncateString(order.dataToEncryptHash)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Orders