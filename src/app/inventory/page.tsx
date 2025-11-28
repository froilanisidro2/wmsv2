"use client";
import React from 'react';

export default function InventoryPage() {
  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Inventory</h1>
      <div className="bg-white p-6 rounded-lg border shadow">
        <table className="min-w-full border bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-200 text-gray-900">
              <th className="border px-2 py-1">Item ID</th>
              <th className="border px-2 py-1">Location ID</th>
              <th className="border px-2 py-1">Warehouse ID</th>
              <th className="border px-2 py-1">On Hand Qty</th>
              <th className="border px-2 py-1">Allocated Qty</th>
              <th className="border px-2 py-1">Available Qty</th>
            </tr>
          </thead>
          <tbody>
            {/* TODO: Map inventory data here */}
            <tr>
              <td className="border px-2 py-1">item-uuid</td>
              <td className="border px-2 py-1">location-uuid</td>
              <td className="border px-2 py-1">warehouse-uuid</td>
              <td className="border px-2 py-1">100</td>
              <td className="border px-2 py-1">20</td>
              <td className="border px-2 py-1">80</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
