// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;


// import React from "react";
// import "./App.css";
// import OverviewCard from "./components/OverviewCard";
// import SalesChart from "./components/SalesChart";
// import StockAlerts from "./components/StockAlerts";
// import TopSellingProducts from "./components/TopSellingProducts";
// import PaymentsReceived from "./components/PaymentsRecieved";
// import Alerts from "./components/Alerts";

// function App() {
//   return (
//     <div className="App">
//       {/* Navigation Bar */}
//       <nav className="bg-blue-600 p-4 text-white text-center text-xl">
//         Shop Management Dashboard
//       </nav>

//       {/* Main Dashboard Layout */}
//       <div className="container mx-auto p-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           <OverviewCard />
//           <SalesChart />
//           <StockAlerts />
//           <TopSellingProducts />
//           <PaymentsReceived />
//           <Alerts />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;


import React from "react";
import "./App.css";
import MainDashboard from "./pages/main_dashboard"; // Ensure correct path

function App() {
  return (
    <div className="App">
      <MainDashboard />
    </div>
  );
}

export default App;
