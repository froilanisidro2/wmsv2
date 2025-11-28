"use client";
import React, { useState } from 'react';

const tabs = [
  { name: 'Vendors', key: 'vendors' },
  { name: 'Customers', key: 'customers' },
  { name: 'Items', key: 'items' },
  { name: 'Warehouses', key: 'warehouses' },
  { name: 'Locations', key: 'locations' },
];

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState('vendors');

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Configuration</h1>
      <div className="mb-6 flex gap-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded font-semibold border-b-2 ${activeTab === tab.key ? 'border-blue-600 text-blue-600 bg-white shadow' : 'border-transparent text-gray-700 bg-gray-200'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg border shadow">
        {activeTab === 'vendors' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Vendors List</h2>
            {/* TODO: Map vendors data here */}
            <table className="min-w-full border bg-white rounded-lg shadow">
              <thead>
                <tr className="bg-gray-200 text-gray-900">
                  <th className="border px-2 py-1">Vendor ID</th>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Contact</th>
                  <th className="border px-2 py-1">TIN</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">vendor-uuid</td>
                  <td className="border px-2 py-1">Vendor Name</td>
                  <td className="border px-2 py-1">Contact Person</td>
                  <td className="border px-2 py-1">123456789</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'customers' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Customers List</h2>
            {/* TODO: Map customers data here */}
            <table className="min-w-full border bg-white rounded-lg shadow">
              <thead>
                <tr className="bg-gray-200 text-gray-900">
                  <th className="border px-2 py-1">Customer ID</th>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Contact</th>
                  <th className="border px-2 py-1">TIN</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">customer-uuid</td>
                  <td className="border px-2 py-1">Customer Name</td>
                  <td className="border px-2 py-1">Contact Person</td>
                  <td className="border px-2 py-1">987654321</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'items' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Items List</h2>
            {/* TODO: Map items data here */}
            <table className="min-w-full border bg-white rounded-lg shadow">
              <thead>
                <tr className="bg-gray-200 text-gray-900">
                  <th className="border px-2 py-1">Item ID</th>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Description</th>
                  <th className="border px-2 py-1">UOM</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">item-uuid</td>
                  <td className="border px-2 py-1">Item Name</td>
                  <td className="border px-2 py-1">Description</td>
                  <td className="border px-2 py-1">PCS</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'warehouses' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Warehouses List</h2>
            {/* TODO: Map warehouses data here */}
            <table className="min-w-full border bg-white rounded-lg shadow">
              <thead>
                <tr className="bg-gray-200 text-gray-900">
                  <th className="border px-2 py-1">Warehouse ID</th>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Address</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">warehouse-uuid</td>
                  <td className="border px-2 py-1">Warehouse Name</td>
                  <td className="border px-2 py-1">Address</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'locations' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Locations List</h2>
            {/* TODO: Map locations data here */}
            <table className="min-w-full border bg-white rounded-lg shadow">
              <thead>
                <tr className="bg-gray-200 text-gray-900">
                  <th className="border px-2 py-1">Location ID</th>
                  <th className="border px-2 py-1">Warehouse ID</th>
                  <th className="border px-2 py-1">Code</th>
                  <th className="border px-2 py-1">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">location-uuid</td>
                  <td className="border px-2 py-1">warehouse-uuid</td>
                  <td className="border px-2 py-1">A-01</td>
                  <td className="border px-2 py-1">Rack A, Level 1</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
