import Header from "./components/Header"
import Orders from "./components/Orders";
import SwapCompnent from "./components/SwapComponent"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {


  return (
<div className="bg-gray-300 min-h-screen flex flex-col">
  <Router>
    <Header />
    <Routes>
      <Route path="/" element={<SwapCompnent />} />
      <Route path="/orders" element={<Orders />} />
    </Routes>
  </Router>
</div>
  )
}

export default App