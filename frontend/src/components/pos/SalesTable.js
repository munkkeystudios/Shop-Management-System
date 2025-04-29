import React from 'react';
import { Table } from 'react-bootstrap';

function SalesTable({ sales }) {
  return (
    <>
      <style>
        {`
          .sales-table {
            table-layout: fixed;
            width: 100%;
            font-size: 100%;
          }
          
          .sales-table th,
          .sales-table td {
            vertical-align: middle;
            padding: 2.5%;
            text-align: left;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.5;
            font-size: 105%;
          }
          
          .sales-status-badge {
            display: inline-flex;
            align-items: center;
            padding: 2% 5%;
            border-radius: 0.5rem;
            font-size: 95%;
            font-weight: 600;
            text-align: center;
            white-space: nowrap;
            line-height: 1.2;
            height: auto;
          }
          
          .paid {
            background-color: #d1e7dd;
            color: #0f5132;
          }
          
          .partial {
            background-color: #fff3cd;
            color: #856404;
          }
          
          .unpaid, .due {
            background-color: #f8d7da;
            color: #842029;
          }
          
          .default {
            background-color: #e2e3e5;
            color: #41464b;
          }
        `}
      </style>
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
              <td colSpan="3">
                No sales data available
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}

export default SalesTable;
