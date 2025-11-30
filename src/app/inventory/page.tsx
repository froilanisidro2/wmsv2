"use client";
import React, { useState, useEffect } from 'react';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInventory() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_URL_INVENTORY || "http://47.128.154.44:8030/inventory", {
          headers: { 'X-Api-Key': process.env.NEXT_PUBLIC_X_API_KEY || '' }
        });
        if (!res.ok) throw new Error('Failed to fetch inventory');
        setInventory(await res.json());
      } catch (err: any) {
        setError(err.message || 'Failed to fetch inventory');
      }
      setLoading(false);
    }
    fetchInventory();
  }, []);

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Inventory</h1>
      <div className="bg-white p-6 rounded-lg border shadow">
        <button
          className="mb-2 px-4 py-1 bg-blue-500 text-white rounded text-xs font-bold"
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const res = await fetch(process.env.NEXT_PUBLIC_URL_INVENTORY || "http://47.128.154.44:8030/inventory", {
                headers: { 'X-Api-Key': process.env.NEXT_PUBLIC_X_API_KEY || '' }
              });
              if (!res.ok) throw new Error('Failed to fetch inventory');
              setInventory(await res.json());
            } catch (err: any) {
              setError(err.message || 'Failed to fetch inventory');
            }
            setLoading(false);
          }}
        >Refresh</button>
        {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
        <div style={{ maxHeight: 400, overflow: 'auto', minWidth: '100%' }}>
          <table className="min-w-full border bg-white rounded-lg shadow text-xs" style={{ minWidth: 1200 }}>
            <thead>
              <tr className="bg-gray-200 text-gray-900">
                <th className="border px-2 py-1">Item Code</th>
                <th className="border px-2 py-1">Item Name</th>
                <th className="border px-2 py-1">Warehouse</th>
                <th className="border px-2 py-1">Location</th>
                <th className="border px-2 py-1">Batch</th>
                <th className="border px-2 py-1">On Hand Qty</th>
                <th className="border px-2 py-1">Allocated Qty</th>
                <th className="border px-2 py-1">Available Qty</th>
                <th className="border px-2 py-1">UOM</th>
                <th className="border px-2 py-1">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((inv: any, idx: number) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{inv.item_code || inv.item_id}</td>
                  <td className="border px-2 py-1">{inv.item_name}</td>
                  <td className="border px-2 py-1">{inv.warehouse_code || inv.warehouse_id}</td>
                  <td className="border px-2 py-1">{inv.location_code || inv.location_id}</td>
                  <td className="border px-2 py-1">{inv.batch_number || ''}</td>
                  <td className="border px-2 py-1">{inv.on_hand_quantity}</td>
                  <td className="border px-2 py-1">{inv.allocated_quantity}</td>
                  <td className="border px-2 py-1">{inv.available_quantity}</td>
                  <td className="border px-2 py-1">{inv.uom}</td>
                  <td className="border px-2 py-1">{inv.updated_at || inv.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
