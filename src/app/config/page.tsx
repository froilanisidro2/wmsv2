"use client";
import React, { useState, useEffect } from 'react';
import { getVendors, getCustomers, getItems, getWarehouses, getLocations, fetchConfigData } from './api';

// Helper: POST to backend
async function postConfigData(url: string, data: any) {
  const apiKey = process.env.NEXT_PUBLIC_X_API_KEY || '';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to add: ${res.status}`);
  const text = await res.text();
  if (!text) return {}; // Defensive: avoid JSON parse error on empty response
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

const tabs = [
  { name: 'Vendors', key: 'vendors' },
  { name: 'Customers', key: 'customers' },
  { name: 'Items', key: 'items' },
  { name: 'Warehouses', key: 'warehouses' },
  { name: 'Locations', key: 'locations' },
  { name: 'Users', key: 'users' },
];

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState('vendors');
  const [vendors, setVendors] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAll() {
      try {
        setVendors(await getVendors());
        setCustomers(await getCustomers());
        setItems(await getItems());
        setWarehouses(await getWarehouses());
        setLocations(await getLocations());
      } catch (err) {
        // Optionally handle error
      }
      const res = await fetch("http://47.128.154.44:8030/users", { headers: { 'X-Api-Key': process.env.NEXT_PUBLIC_X_API_KEY || '' } });
      if (res.ok) setUsers(await res.json());
      // Fetch inventory
      const invRes = await fetch("http://47.128.154.44:8030/inventory", { headers: { 'X-Api-Key': process.env.NEXT_PUBLIC_X_API_KEY || '' } });
      if (invRes.ok) setInventory(await invRes.json());
    }
    fetchAll();
  }, []);

  // Endpoint mapping (direct URLs)
  const endpoints: any = {
    vendors: "http://47.128.154.44:8030/vendors",
    customers: "http://47.128.154.44:8030/customers",
    items: "http://47.128.154.44:8030/items",
    warehouses: "http://47.128.154.44:8030/warehouses",
    locations: "http://47.128.154.44:8030/locations",
    inventory: "http://47.128.154.44:8030/inventory",
  };

  // Form field definitions for each tab
  const formFields: any = {
    vendors: [
      { name: 'vendor_code', label: 'Vendor Code' },
      { name: 'vendor_name', label: 'Vendor Name' },
      { name: 'contact_person', label: 'Contact Person' },
      { name: 'address', label: 'Address' },
      { name: 'phone', label: 'Phone' },
      { name: 'email', label: 'Email' },
      { name: 'tin', label: 'TIN' },
      { name: 'payment_terms', label: 'Payment Terms' },
      { name: 'delivery_terms', label: 'Delivery Terms' },
      { name: 'contact_number', label: 'Contact Number' },
    ],
    customers: [
      { name: 'customer_code', label: 'Customer Code' },
      { name: 'customer_name', label: 'Customer Name' },
      { name: 'contact_person', label: 'Contact Person' },
      { name: 'address', label: 'Address' },
      { name: 'phone', label: 'Phone' },
      { name: 'email', label: 'Email' },
      { name: 'tin', label: 'TIN' },
      { name: 'payment_terms', label: 'Payment Terms' },
      { name: 'delivery_terms', label: 'Delivery Terms' },
      { name: 'credit_limit', label: 'Credit Limit' },
    ],
    items: [
      { name: 'company_id', label: 'Company ID' },
      { name: 'item_code', label: 'Item Code' },
      { name: 'item_name', label: 'Item Name' },
      { name: 'description', label: 'Description' },
      { name: 'unit_of_measure', label: 'Unit of Measure' },
      { name: 'item_category', label: 'Item Category' },
      { name: 'item_group', label: 'Item Group' },
      { name: 'abc_classification', label: 'ABC Classification' },
      { name: 'weight_kg', label: 'Weight (kg)' },
      { name: 'length_cm', label: 'Length (cm)' },
      { name: 'width_cm', label: 'Width (cm)' },
      { name: 'height_cm', label: 'Height (cm)' },
      { name: 'volume_cbm', label: 'Volume (cbm)' },
      { name: 'pallet_qty', label: 'Pallet Qty' },
      { name: 'pallet_height_cm', label: 'Pallet Height (cm)' },
      { name: 'stackable', label: 'Stackable' },
      { name: 'max_stack_height', label: 'Max Stack Height' },
      { name: 'min_stock_level', label: 'Min Stock Level' },
      { name: 'max_stock_level', label: 'Max Stock Level' },
      { name: 'reorder_point', label: 'Reorder Point' },
      { name: 'batch_tracking', label: 'Batch Tracking' },
      { name: 'serial_tracking', label: 'Serial Tracking' },
      { name: 'expiry_tracking', label: 'Expiry Tracking' },
      { name: 'shelf_life_days', label: 'Shelf Life (days)' },
      { name: 'uom', label: 'UOM' },
      { name: 'brand', label: 'Brand' },
      { name: 'color', label: 'Color' },
    ],
    warehouses: [
      { name: 'company_id', label: 'Company ID' },
      { name: 'warehouse_code', label: 'Warehouse Code' },
      { name: 'warehouse_name', label: 'Warehouse Name' },
      { name: 'address', label: 'Address' },
      { name: 'contact_person', label: 'Contact Person' },
      { name: 'phone', label: 'Phone' },
    ],
    locations: [
      { name: 'warehouse_id', label: 'Warehouse ID' },
      { name: 'location_code', label: 'Location Code' },
      { name: 'location_name', label: 'Location Name' },
      { name: 'location_type', label: 'Location Type' },
      { name: 'zone', label: 'Zone' },
      { name: 'aisle', label: 'Aisle' },
      { name: 'rack', label: 'Rack' },
      { name: 'level', label: 'Level' },
      { name: 'bin', label: 'Bin' },
      { name: 'max_weight_kg', label: 'Max Weight (kg)' },
      { name: 'max_volume_cbm', label: 'Max Volume (cbm)' },
      { name: 'max_pallets', label: 'Max Pallets' },
      { name: 'temperature_controlled', label: 'Temperature Controlled' },
      { name: 'hazmat_approved', label: 'Hazmat Approved' },
      { name: 'warehouse_code', label: 'Warehouse Code' },
      { name: 'description', label: 'Description' },
    ],
  };

  // Handle form field change
  function handleFormChange(tab: string, field: string, value: any) {
    setFormData((prev: any) => ({ ...prev, [tab]: { ...prev[tab], [field]: value } }));
  }

  // Handle form submit
  async function handleFormSubmit(tab: string) {
    setLoading(true);
    setError(null);
    if (!endpoints[tab]) {
      setError('API endpoint for this tab is not defined in .env.local.');
      setLoading(false);
      return;
    }
    try {
      let payload = formData[tab];
      // Remove company_id for customers POST
      if (tab === 'customers') {
        const { company_id, ...rest } = payload;
        payload = rest;
      }
      await postConfigData(endpoints[tab], payload);
      setShowAddForm((prev: any) => ({ ...prev, [tab]: false }));
      setFormData((prev: any) => ({ ...prev, [tab]: {} }));
      // Refresh data
      if (tab === 'vendors') setVendors(await getVendors());
      if (tab === 'customers') setCustomers(await getCustomers());
      if (tab === 'items') setItems(await getItems());
      if (tab === 'warehouses') setWarehouses(await getWarehouses());
      if (tab === 'locations') setLocations(await getLocations());
      if (tab === 'users') {
        const res = await fetch(endpoints.users, { headers: { 'X-Api-Key': process.env.NEXT_PUBLIC_X_API_KEY || '' } });
        if (res.ok) setUsers(await res.json());
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add record');
    }
    setLoading(false);
  }

  // Add form UI
  function renderAddForm(tab: string) {
    if (!formFields[tab]) {
      return <div className="mb-4 p-4 border rounded bg-gray-50 text-red-600">No form fields defined for this tab.</div>;
    }
    return (
      <div className="mb-4 p-4 border rounded bg-gray-50">
        <h3 className="font-bold mb-2">Add {tabs.find(t => t.key === tab)?.name}</h3>
        <form onSubmit={e => { e.preventDefault(); handleFormSubmit(tab); }}>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {formFields[tab].map((field: any) => (
              <div key={field.name}>
                <label className="block text-xs font-semibold mb-1">{field.label}</label>
                <input
                  className="border px-2 py-1 rounded w-full text-xs"
                  type="text"
                  value={formData[tab]?.[field.name] || ''}
                  onChange={e => handleFormChange(tab, field.name, e.target.value)}
                  required
                />
              </div>
            ))}
          </div>
          {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
          <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded text-xs font-bold" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="ml-2 px-4 py-1 bg-gray-400 text-white rounded text-xs font-bold" onClick={() => setShowAddForm((prev: any) => ({ ...prev, [tab]: false }))}>
            Cancel
          </button>
        </form>
      </div>
    );
  }

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
        {/* Add button and form for each tab */}
        <div className="mb-2">
          <button
            className="px-4 py-1 bg-green-600 text-white rounded text-xs font-bold"
            onClick={() => setShowAddForm((prev: any) => ({ ...prev, [activeTab]: true }))}
          >
            + Add {tabs.find(t => t.key === activeTab)?.name}
          </button>
        </div>
        {showAddForm[activeTab] && renderAddForm(activeTab)}
        {activeTab === 'vendors' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Vendors List</h2>
            <div style={{ maxHeight: 400, overflow: 'auto', minWidth: '100%' }}>
              <table className="min-w-full border bg-white rounded-lg shadow text-xs" style={{ minWidth: 1200 }}>
                <thead>
                  <tr className="bg-gray-200 text-gray-900">
                    <th className="border px-2 py-1">ID</th>
                    <th className="border px-2 py-1">Vendor Code</th>
                    <th className="border px-2 py-1">Vendor Name</th>
                    <th className="border px-2 py-1">Contact Person</th>
                    <th className="border px-2 py-1">Address</th>
                    <th className="border px-2 py-1">Phone</th>
                    <th className="border px-2 py-1">Email</th>
                    <th className="border px-2 py-1">TIN</th>
                    <th className="border px-2 py-1">Payment Terms</th>
                    <th className="border px-2 py-1">Delivery Terms</th>
                    <th className="border px-2 py-1">Is Active</th>
                    <th className="border px-2 py-1">Created At</th>
                    {/* <th className="border px-2 py-1">Updated At</th> */}
                    <th className="border px-2 py-1">Contact Number</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map(vendor => (
                    <tr key={vendor.id}>
                      <td className="border px-2 py-1">{vendor.id}</td>
                      <td className="border px-2 py-1">{vendor.vendor_code}</td>
                      <td className="border px-2 py-1">{vendor.vendor_name}</td>
                      <td className="border px-2 py-1">{vendor.contact_person}</td>
                      <td className="border px-2 py-1">{vendor.address}</td>
                      <td className="border px-2 py-1">{vendor.phone}</td>
                      <td className="border px-2 py-1">{vendor.email}</td>
                      <td className="border px-2 py-1">{vendor.tin}</td>
                      <td className="border px-2 py-1">{vendor.payment_terms}</td>
                      <td className="border px-2 py-1">{vendor.delivery_terms}</td>
                      <td className="border px-2 py-1">{String(vendor.is_active)}</td>
                      <td className="border px-2 py-1">{vendor.created_at}</td>
                      <td className="border px-2 py-1">{vendor.updated_at}</td>
                      <td className="border px-2 py-1">{vendor.contact_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'customers' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Customers List</h2>
            <button
              className="mb-2 px-4 py-1 bg-blue-500 text-white rounded text-xs font-bold"
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const data = await getCustomers();
                  setCustomers(data);
                } catch (err: any) {
                  setError(err.message || 'Failed to fetch customers');
                }
                setLoading(false);
              }}
            >Refresh</button>
            {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
            <div style={{ maxHeight: 400, overflow: 'auto', minWidth: '100%' }}>
              <table className="min-w-full border bg-white rounded-lg shadow text-xs" style={{ minWidth: 1200 }}>
                <thead>
                  <tr className="bg-gray-200 text-gray-900">
                    <th className="border px-2 py-1">ID</th>
                    {/* <th className="border px-2 py-1">Company ID</th> */}
                    <th className="border px-2 py-1">Customer Code</th>
                    <th className="border px-2 py-1">Customer Name</th>
                    <th className="border px-2 py-1">Contact Person</th>
                    <th className="border px-2 py-1">Address</th>
                    <th className="border px-2 py-1">Phone</th>
                    <th className="border px-2 py-1">Email</th>
                    <th className="border px-2 py-1">TIN</th>
                    <th className="border px-2 py-1">Payment Terms</th>
                    <th className="border px-2 py-1">Delivery Terms</th>
                    <th className="border px-2 py-1">Credit Limit</th>
                    <th className="border px-2 py-1">Is Active</th>
                    <th className="border px-2 py-1">Created At</th>
                    {/* <th className="border px-2 py-1">Updated At</th> */}
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer.id}>
                      <td className="border px-2 py-1">{customer.id}</td>
                      {/* <td className="border px-2 py-1">{customer.company_id}</td> */}
                      <td className="border px-2 py-1">{customer.customer_code}</td>
                      <td className="border px-2 py-1">{customer.customer_name}</td>
                      <td className="border px-2 py-1">{customer.contact_person}</td>
                      <td className="border px-2 py-1">{customer.address}</td>
                      <td className="border px-2 py-1">{customer.phone}</td>
                      <td className="border px-2 py-1">{customer.email}</td>
                      <td className="border px-2 py-1">{customer.tin}</td>
                      <td className="border px-2 py-1">{customer.payment_terms}</td>
                      <td className="border px-2 py-1">{customer.delivery_terms}</td>
                      <td className="border px-2 py-1">{customer.credit_limit}</td>
                      <td className="border px-2 py-1">{String(customer.is_active)}</td>
                      <td className="border px-2 py-1">{customer.created_at}</td>
                      <td className="border px-2 py-1">{customer.updated_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'items' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Items List</h2>
            <button
              className="mb-2 px-4 py-1 bg-blue-500 text-white rounded text-xs font-bold"
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const data = await getItems();
                  setItems(data);
                } catch (err: any) {
                  setError(err.message || 'Failed to fetch items');
                }
                setLoading(false);
              }}
            >Refresh</button>
            {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
            <div style={{ maxHeight: 400, overflow: 'auto', minWidth: '100%' }}>
              <table className="min-w-full border bg-white rounded-lg shadow text-xs" style={{ minWidth: 1200 }}>
                <thead>
                  <tr className="bg-gray-200 text-gray-900">
                    <th className="border px-2 py-1">ID</th>
                    {/* <th className="border px-2 py-1">Company ID</th> */}
                    <th className="border px-2 py-1">Item Code</th>
                    <th className="border px-2 py-1">Item Name</th>
                    <th className="border px-2 py-1">Description</th>
                    <th className="border px-2 py-1">Unit of Measure</th>
                    <th className="border px-2 py-1">Item Category</th>
                    <th className="border px-2 py-1">Item Group</th>
                    <th className="border px-2 py-1">ABC Classification</th>
                    <th className="border px-2 py-1">Weight (kg)</th>
                    <th className="border px-2 py-1">Length (cm)</th>
                    <th className="border px-2 py-1">Width (cm)</th>
                    <th className="border px-2 py-1">Height (cm)</th>
                    <th className="border px-2 py-1">Volume (cbm)</th>
                    <th className="border px-2 py-1">Pallet Qty</th>
                    <th className="border px-2 py-1">Pallet Height (cm)</th>
                    <th className="border px-2 py-1">Stackable</th>
                    <th className="border px-2 py-1">Max Stack Height</th>
                    <th className="border px-2 py-1">Min Stock Level</th>
                    <th className="border px-2 py-1">Max Stock Level</th>
                    <th className="border px-2 py-1">Reorder Point</th>
                    <th className="border px-2 py-1">Batch Tracking</th>
                    <th className="border px-2 py-1">Serial Tracking</th>
                    <th className="border px-2 py-1">Expiry Tracking</th>
                    <th className="border px-2 py-1">Shelf Life (days)</th>
                    <th className="border px-2 py-1">Is Active</th>
                    <th className="border px-2 py-1">Created At</th>
                    {/* <th className="border px-2 py-1">Updated At</th> */}
                    <th className="border px-2 py-1">UOM</th>
                    <th className="border px-2 py-1">Brand</th>
                    <th className="border px-2 py-1">Color</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td className="border px-2 py-1">{item.id}</td>
                      {/* <td className="border px-2 py-1">{item.company_id}</td> */}
                      <td className="border px-2 py-1">{item.item_code}</td>
                      <td className="border px-2 py-1">{item.item_name}</td>
                      <td className="border px-2 py-1">{item.description}</td>
                      <td className="border px-2 py-1">{item.unit_of_measure}</td>
                      <td className="border px-2 py-1">{item.item_category}</td>
                      <td className="border px-2 py-1">{item.item_group}</td>
                      <td className="border px-2 py-1">{item.abc_classification}</td>
                      <td className="border px-2 py-1">{item.weight_kg}</td>
                      <td className="border px-2 py-1">{item.length_cm}</td>
                      <td className="border px-2 py-1">{item.width_cm}</td>
                      <td className="border px-2 py-1">{item.height_cm}</td>
                      <td className="border px-2 py-1">{item.volume_cbm}</td>
                      <td className="border px-2 py-1">{item.pallet_qty}</td>
                      <td className="border px-2 py-1">{item.pallet_height_cm}</td>
                      <td className="border px-2 py-1">{String(item.stackable)}</td>
                      <td className="border px-2 py-1">{item.max_stack_height}</td>
                      <td className="border px-2 py-1">{item.min_stock_level}</td>
                      <td className="border px-2 py-1">{item.max_stock_level}</td>
                      <td className="border px-2 py-1">{item.reorder_point}</td>
                      <td className="border px-2 py-1">{String(item.batch_tracking)}</td>
                      <td className="border px-2 py-1">{String(item.serial_tracking)}</td>
                      <td className="border px-2 py-1">{String(item.expiry_tracking)}</td>
                      <td className="border px-2 py-1">{item.shelf_life_days}</td>
                      <td className="border px-2 py-1">{String(item.is_active)}</td>
                      <td className="border px-2 py-1">{item.created_at}</td>
                      {/* <td className="border px-2 py-1">{item.updated_at}</td> */}
                      <td className="border px-2 py-1">{item.uom}</td>
                      <td className="border px-2 py-1">{item.brand}</td>
                      <td className="border px-2 py-1">{item.color}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'warehouses' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Warehouses List</h2>
            <button
              className="mb-2 px-4 py-1 bg-blue-500 text-white rounded text-xs font-bold"
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const data = await getWarehouses();
                  setWarehouses(data);
                } catch (err: any) {
                  setError(err.message || 'Failed to fetch warehouses');
                }
                setLoading(false);
              }}
            >Refresh</button>
            {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
            <div style={{ maxHeight: 400, overflow: 'auto', minWidth: '100%' }}>
              <table className="min-w-full border bg-white rounded-lg shadow text-xs" style={{ minWidth: 1200 }}>
                <thead>
                  <tr className="bg-gray-200 text-gray-900">
                    <th className="border px-2 py-1">ID</th>
                    <th className="border px-2 py-1">Company ID</th>
                    <th className="border px-2 py-1">Warehouse Code</th>
                    <th className="border px-2 py-1">Warehouse Name</th>
                    <th className="border px-2 py-1">Address</th>
                    <th className="border px-2 py-1">Contact Person</th>
                    <th className="border px-2 py-1">Phone</th>
                    <th className="border px-2 py-1">Is Active</th>
                    <th className="border px-2 py-1">Created At</th>
                    <th className="border px-2 py-1">Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map(wh => (
                    <tr key={wh.id}>
                      <td className="border px-2 py-1">{wh.id}</td>
                      {/* <td className="border px-2 py-1">{wh.company_id}</td> */}
                      <td className="border px-2 py-1">{wh.warehouse_code}</td>
                      <td className="border px-2 py-1">{wh.warehouse_name}</td>
                      <td className="border px-2 py-1">{wh.address}</td>
                      <td className="border px-2 py-1">{wh.contact_person}</td>
                      <td className="border px-2 py-1">{wh.phone}</td>
                      <td className="border px-2 py-1">{String(wh.is_active)}</td>
                      <td className="border px-2 py-1">{wh.created_at}</td>
                      {/* <td className="border px-2 py-1">{wh.updated_at}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'locations' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Locations List</h2>
            <button
              className="mb-2 px-4 py-1 bg-blue-500 text-white rounded text-xs font-bold"
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const data = await getLocations();
                  setLocations(data);
                } catch (err: any) {
                  setError(err.message || 'Failed to fetch locations');
                }
                setLoading(false);
              }}
            >Refresh</button>
            {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
            <div style={{ maxHeight: 400, overflow: 'auto', minWidth: '100%' }}>
              <table className="min-w-full border bg-white rounded-lg shadow text-xs" style={{ minWidth: 1200 }}>
                <thead>
                  <tr className="bg-gray-200 text-gray-900">
                    <th className="border px-2 py-1">ID</th>
                    <th className="border px-2 py-1">Warehouse ID</th>
                    <th className="border px-2 py-1">Location Code</th>
                    <th className="border px-2 py-1">Location Name</th>
                    <th className="border px-2 py-1">Location Type</th>
                    <th className="border px-2 py-1">Zone</th>
                    <th className="border px-2 py-1">Aisle</th>
                    <th className="border px-2 py-1">Rack</th>
                    <th className="border px-2 py-1">Level</th>
                    <th className="border px-2 py-1">Bin</th>
                    <th className="border px-2 py-1">Max Weight (kg)</th>
                    <th className="border px-2 py-1">Max Volume (cbm)</th>
                    <th className="border px-2 py-1">Max Pallets</th>
                    <th className="border px-2 py-1">Temperature Controlled</th>
                    <th className="border px-2 py-1">Hazmat Approved</th>
                    <th className="border px-2 py-1">Is Active</th>
                    <th className="border px-2 py-1">Created At</th>
                    <th className="border px-2 py-1">Updated At</th>
                    <th className="border px-2 py-1">Warehouse Code</th>
                    <th className="border px-2 py-1">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map(loc => (
                    <tr key={loc.id}>
                      <td className="border px-2 py-1">{loc.id}</td>
                      <td className="border px-2 py-1">{loc.warehouse_id}</td>
                      <td className="border px-2 py-1">{loc.location_code}</td>
                      <td className="border px-2 py-1">{loc.location_name}</td>
                      <td className="border px-2 py-1">{loc.location_type}</td>
                      <td className="border px-2 py-1">{loc.zone}</td>
                      <td className="border px-2 py-1">{loc.aisle}</td>
                      <td className="border px-2 py-1">{loc.rack}</td>
                      <td className="border px-2 py-1">{loc.level}</td>
                      <td className="border px-2 py-1">{loc.bin}</td>
                      <td className="border px-2 py-1">{loc.max_weight_kg}</td>
                      <td className="border px-2 py-1">{loc.max_volume_cbm}</td>
                      <td className="border px-2 py-1">{loc.max_pallets}</td>
                      <td className="border px-2 py-1">{String(loc.temperature_controlled)}</td>
                      <td className="border px-2 py-1">{String(loc.hazmat_approved)}</td>
                      <td className="border px-2 py-1">{String(loc.is_active)}</td>
                      <td className="border px-2 py-1">{loc.created_at}</td>
                      {/* <td className="border px-2 py-1">{loc.updated_at}</td> */}
                      <td className="border px-2 py-1">{loc.warehouse_code}</td>
                      <td className="border px-2 py-1">{loc.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
