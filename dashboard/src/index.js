// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import './styles/tailwind.css';
import "./index.css";
import App from "./App"; // Root component
import reportWebVitals from "./reportWebVitals";

// Ensure Tailwind is imported if you're using it
import "./styles/tailwind.css"; 

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App /> {/* Ensuring the App component correctly renders the dashboard */}
  </React.StrictMode>
);

// Optional: Performance logging
reportWebVitals();
