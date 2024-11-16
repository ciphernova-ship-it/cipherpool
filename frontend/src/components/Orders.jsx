import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BACKEND_BASE_URL, TOAST_CONFIG } from "../utils/constants";
import { useAccount } from "wagmi";
import truncateEthAddress from 'truncate-eth-address'

const Orders = () => {


  const { isConnected, address } = useAccount()
  const [encryptedOrder, setEncryptedOder] = useState([]);


  const fetchEncrypterOrder = async () => {
    const orderToast = toast.loading("fetching open orders...", TOAST_CONFIG)
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

    }finally{
      toast.dismiss(orderToast)
    }
  }

  useEffect(() => {
    if (isConnected) {
      fetchEncrypterOrder()
    }

    return ()=> setEncryptedOder([])

  }, [address])


  console.log(encryptedOrder)


  return (
    <div className="flex justify-center items-center m-4 md:m-10">
      <div className="flex flex-col gap-4 bg-white rounded-3xl p-4 w-full max-w-[680px] shadow-xl">
        <label className="text-sm md:text-lg font-bold pl-2">Trade History</label>

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
                    <td className="px-2 py-2 border-b text-center whitespace-nowrap cursor-pointer hover:text-red-300">{truncateEthAddress(order.sourceToken)}</td>
                    <td className="px-2 py-2 border-b text-center">{truncateEthAddress(order.destToken)}</td>
                    <td className="px-2 py-2 border-b text-center">{order.ciphertext}</td>
                    <td className="px-2 py-2 border-b text-center">{order.dataToEncryptHash}</td>
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