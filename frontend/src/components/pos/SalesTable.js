import React from 'react';
import { Table } from 'react-bootstrap';
import '../styles/SalesTable.css';

function SalesTable({ sales }) {
  return (
    <Table bordered hover className="sales-table">
      <thead>
        <tr>
          <th>Bill No</th>
          <th>Status</th>
          <th>Total Bill</th>
        </tr>
      </thead>
      <tbody>
        {sales && sales.length > 0 ? (
          sales.map((sale) => (
            <tr key={sale._id}>
              <td>{sale.billNumber}</td>
              <td>
                <span className={`sales-status-badge ${sale.paymentStatus.toLowerCase()}`}>
                  {sale.paymentStatus}
                </span>
              </td>
              <td>${sale.total.toFixed(2)}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3" className="text-center">
              No sales data available
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

export default SalesTable;
