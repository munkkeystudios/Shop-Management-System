// src/components/PaymentsReceived.js
import React from "react";

const PaymentsReceived = ({ payments = [] }) => {
  return (
    <div>
      <h2>Payments Received</h2>
      {payments.length > 0 ? (
        payments.map((payment, index) => (
          <div key={index}>{payment.amount}</div>
        ))
      ) : (
        <p>No payments received</p>
      )}
    </div>
  );
};


export default PaymentsReceived;
