"use client";
import React from 'react';

export default function OutboundPage() {
  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Outbound Shipments</h1>
      <div className="bg-white p-6 rounded-lg border shadow">
        <table className="min-w-full border bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-200 text-gray-900">
              <th className="border px-2 py-1">Order ID</th>
              <th className="border px-2 py-1">Customer ID</th>
              <th className="border px-2 py-1">Item ID</th>
              <th className="border px-2 py-1">Quantity</th>
              <th className="border px-2 py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {/* TODO: Map outbound data here */}
            <tr>
              <td className="border px-2 py-1">order-uuid</td>
              <td className="border px-2 py-1">customer-uuid</td>
              <td className="border px-2 py-1">item-uuid</td>
              <td className="border px-2 py-1">50</td>
              <td className="border px-2 py-1">Shipped</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
