"use client";
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
// import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register all community modules for AG Grid v34+ (ESM)
ModuleRegistry.registerModules([AllCommunityModule]);

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const apiKey = process.env.NEXT_PUBLIC_X_API_KEY || '';
const urlHeaders = process.env.NEXT_PUBLIC_URL_ASN_HEADERS || '';
const urlLines = process.env.NEXT_PUBLIC_URL_ASN_LINES || '';

const columnDefs = [
  { headerName: 'Item ID', field: 'itemId', editable: true },
  { headerName: 'Item Description', field: 'itemDescription', editable: true },
  { headerName: 'Expected Qty', field: 'expectedQuantity', editable: true },
  { headerName: 'Received Qty', field: 'receivedQuantity', editable: true },
  { headerName: 'Batch #', field: 'batchNumber', editable: true },
  { headerName: 'Serial #', field: 'serialNumber', editable: true },
  { headerName: 'Mfg Date', field: 'manufacturingDate', editable: true },
  { headerName: 'Expiry Date', field: 'expiryDate', editable: true },
  { headerName: 'Pallet ID', field: 'palletId', editable: true },
  { headerName: 'UOM', field: 'uom', editable: true },
  { headerName: 'Remarks', field: 'remarks', editable: true },
];

interface ASNHeader {
  asnNumber: string;
  vendorId: string;
  vendorName: string;
  poNumber: string;
  asnDate: string;
  status: string;
  remarks: string;
}

interface ASNLine {
  itemId: string;
  itemDescription: string;
  expectedQuantity: string;
  receivedQuantity: string;
  batchNumber: string;
  serialNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  palletId: string;
  uom: string;
  remarks: string;
}

export default function InboundPage() {
    // Record view state
    const [headerRecords, setHeaderRecords] = useState<any[]>([]);
    const [lineRecords, setLineRecords] = useState<any[]>([]);

    // Fetch ASN headers and lines for record view
    useEffect(() => {
      async function fetchRecords() {
        try {
          const headersRes = await fetch('/api/asn_headers', { method: 'GET' });
          const headersData = await headersRes.json();
          setHeaderRecords(Array.isArray(headersData) ? headersData : [headersData]);
          const linesRes = await fetch('/api/asn_lines', { method: 'GET' });
          const linesData = await linesRes.json();
          setLineRecords(Array.isArray(linesData) ? linesData : [linesData]);
        } catch (err) {
          // ...handle error
        }
      }
      fetchRecords();
    }, []);

  // AG Grid column definitions for record view
  const headerRecordCols = [
    { headerName: 'ASN Number', field: 'asn_number', editable: true },
    { headerName: 'Vendor ID', field: 'vendor_id', editable: true },
    { headerName: 'Vendor Name', field: 'vendor_name', editable: true },
    { headerName: 'PO Number', field: 'po_number', editable: true },
    { headerName: 'ASN Date', field: 'asn_date', editable: true },
    {
      headerName: 'Status',
      field: 'status',
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['New', 'Received', 'PutAway', 'Complete'],
      },
    },
    { headerName: 'Remarks', field: 'remarks', editable: true },
  ];

  const lineRecordCols = [
    { headerName: 'Item ID', field: 'item_id', editable: true },
    { headerName: 'Item Description', field: 'item_description', editable: true },
    { headerName: 'Expected Qty', field: 'expected_quantity', editable: true },
    { headerName: 'Received Qty', field: 'received_quantity', editable: true },
    { headerName: 'Batch #', field: 'batch_number', editable: true },
    { headerName: 'Serial #', field: 'serial_number', editable: true },
    { headerName: 'Mfg Date', field: 'manufacturing_date', editable: true },
    { headerName: 'Expiry Date', field: 'expiry_date', editable: true },
    { headerName: 'Pallet ID', field: 'pallet_id', editable: true },
    { headerName: 'UOM', field: 'uom', editable: true },
    { headerName: 'Remarks', field: 'remarks', editable: true },
    {
      headerName: 'Status',
      field: 'status',
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['New', 'Received', 'PutAway', 'Complete'],
      },
    },
  ];
  const pasteTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [header, setHeader] = useState<ASNHeader>({
    asnNumber: uuidv4(),
    vendorId: uuidv4(),
    vendorName: '',
    poNumber: '',
    asnDate: '',
    status: '',
    remarks: '',
  });

  // Auto-generate ASN on mount
  useEffect(() => {
    setHeader(h => ({ ...h, asnNumber: uuidv4() }));
  }, []);
  const [rowCount, setRowCount] = useState(5);
  const [rowData, setRowData] = useState<ASNLine[]>([
    {
      itemId: '',
      itemDescription: '',
      expectedQuantity: '',
      receivedQuantity: '',
      batchNumber: '',
      serialNumber: '',
      manufacturingDate: '',
      expiryDate: '',
      palletId: '',
      uom: '',
      remarks: '',
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const gridRef = useRef<AgGridReact>(null);

  const defaultColDef = useMemo(() => ({ resizable: true, sortable: true, filter: true, minWidth: 120 }), []);

  const handleHeaderChange = (field: keyof ASNHeader, value: string) => {
    setHeader({ ...header, [field]: value });
  };

  const handleRowCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = Math.max(1, Number(e.target.value));
    setRowCount(count);
    setRowData(Array.from({ length: count }, () => ({
      itemId: '',
      itemDescription: '',
      expectedQuantity: '',
      receivedQuantity: '',
      batchNumber: '',
      serialNumber: '',
      manufacturingDate: '',
      expiryDate: '',
      palletId: '',
      uom: '',
      remarks: '',
    })));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    if (!text) return;
    const rows = text.trim().split(/\r?\n/).map(row => row.split('\t'));
    const newRows: ASNLine[] = rows.map(cols => ({
      itemId: cols[0] || '',
      itemDescription: cols[1] || '',
      expectedQuantity: cols[2] || '',
      receivedQuantity: cols[3] || '',
      batchNumber: cols[4] || '',
      serialNumber: cols[5] || '',
      manufacturingDate: cols[6] || '',
      expiryDate: cols[7] || '',
      palletId: cols[8] || '',
      uom: cols[9] || '',
      remarks: cols[10] || '',
    }));
    setRowData(newRows);
    setShowPasteArea(false);
  };

      // (removed stray JSX, only keep in return statement)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    // Validate ASN Date
    if (!header.asnDate) {
      setLoading(false);
      setError('ASN Date is required. Please select a valid date.');
      return;
    }
    try {
      // Validate ASN lines first
      const filteredRows = rowData.filter(row => row.itemId && row.itemId.trim() !== '');
      const asnLinesPayload = filteredRows.map(row => ({
        id: uuidv4(),
        // asn_header_id will be set after header insert
        item_id: row.itemId,
        item_description: row.itemDescription,
        expected_quantity: row.expectedQuantity,
        received_quantity: row.receivedQuantity,
        batch_number: row.batchNumber,
        serial_number: row.serialNumber,
        manufacturing_date: row.manufacturingDate,
        expiry_date: row.expiryDate,
        pallet_id: row.palletId,
        uom: row.uom,
        remarks: row.remarks,
      }));

      console.log('ASN lines payload:', asnLinesPayload);
      if (asnLinesPayload.length === 0) {
        setLoading(false);
        setError('No valid ASN line items to submit. Please fill in at least one Item ID.');
        return;
      }

      // 1. Insert ASN header
      const headerId = uuidv4();
      const asnHeaderPayload = {
        id: headerId,
        asn_number: header.asnNumber,
        vendor_id: header.vendorId,
        vendor_name: header.vendorName,
        po_number: header.poNumber,
        asn_date: header.asnDate,
        status: header.status,
        remarks: header.remarks
      };

      const headerRes = await fetch(urlHeaders, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
        },
        body: JSON.stringify(asnHeaderPayload),
      });

      // Parse header response
      const headerText = await headerRes.text();
      let headerData;
      try {
        headerData = JSON.parse(headerText);
      } catch {
        setLoading(false);
        setError(`ASN header response is not valid JSON. Response: ${headerText.slice(0, 500)}`);
        return;
      }

      let asn_header_id = Array.isArray(headerData) ? headerData[0]?.id : headerData.id;
      if (!asn_header_id) {
        // Fallback: use generated headerId if backend did not return one
        asn_header_id = headerId;
      }

      // Now insert ASN lines with correct header id
      const asnLinesPayloadWithHeader = asnLinesPayload.map(line => ({ ...line, asn_header_id }));

      console.log('Submitting ASN lines to:', urlLines);
      const linesRes = await fetch(urlLines, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
        },
        body: JSON.stringify(asnLinesPayloadWithHeader),
      });

      const linesText = await linesRes.text();
      console.log('Lines response text:', linesText);

      if (!linesRes.ok) {
        setLoading(false);
        setError(`Failed to insert ASN lines. Status: ${linesRes.status}, Response: ${linesText.slice(0, 500)}`);
        return;
      }

      try {
        JSON.parse(linesText);
      } catch {
        setLoading(false);
        setError(`ASN lines response is not valid JSON. Response: ${linesText.slice(0, 500)}`);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      {/* Side-by-side ASN Entry Block */}
      <div className="w-full bg-white rounded-lg border shadow p-6 flex flex-row gap-6" style={{ width: '100%', minWidth: 0 }}>
        {/* Header Fields (left column, 30%) */}
        <div className="min-w-0" style={{ flexBasis: '30%', maxWidth: '30%', minWidth: 0 }}>
          {/* New label inside ASN Headers block */}
          <h2 className="text-2xl font-bold mb-4">Inbound Entry</h2>
          <form className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">ASN</label>
              <input type="text" value={header.asnNumber} readOnly className="border px-2 py-1 w-full rounded bg-gray-100" />
            </div>
            <div>
              <label className="block font-medium mb-1">Vendor ID</label>
              <input type="text" value={header.vendorId} onChange={e => handleHeaderChange('vendorId', e.target.value)} className="border px-2 py-1 w-full rounded" />
              <span className="text-xs text-gray-500">Must be a valid UUID</span>
            </div>
            <div>
              <label className="block font-medium mb-1">Vendor Name</label>
              <input type="text" value={header.vendorName} onChange={e => handleHeaderChange('vendorName', e.target.value)} className="border px-2 py-1 w-full rounded" />
            </div>
            <div>
              <label className="block font-medium mb-1">PO Number</label>
              <input type="text" value={header.poNumber} onChange={e => handleHeaderChange('poNumber', e.target.value)} className="border px-2 py-1 w-full rounded" />
            </div>
            <div>
              <label className="block font-medium mb-1">ASN Date</label>
              <input type="date" value={header.asnDate} onChange={e => handleHeaderChange('asnDate', e.target.value)} className="border px-2 py-1 w-full rounded" />
            </div>
            <div>
              <label className="block font-medium mb-1">Status</label>
              <input type="text" value={header.status} onChange={e => handleHeaderChange('status', e.target.value)} className="border px-2 py-1 w-full rounded" />
            </div>
            <div className="col-span-2">
              <label className="block font-medium mb-1">Remarks</label>
              <input type="text" value={header.remarks} onChange={e => handleHeaderChange('remarks', e.target.value)} className="border px-2 py-1 w-full rounded" />
            </div>
          </form>

          {/* Submit ASN */}
          <form onSubmit={handleSubmit} className="mt-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow font-semibold" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit ASN'}
            </button>
          </form>
        </div>

        {/* AG Grid Entry (right column, 70%) */}
        <div className="min-w-0" style={{ flexBasis: '70%', maxWidth: '70%', minWidth: 0 }}>
          {/* Add Row & Paste Buttons above grid */}
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              className="bg-blue-500 text-white px-3 py-1 rounded shadow font-semibold"
              onClick={() => setRowData([...rowData, {
                itemId: '',
                itemDescription: '',
                expectedQuantity: '',
                receivedQuantity: '',
                batchNumber: '',
                serialNumber: '',
                manufacturingDate: '',
                expiryDate: '',
                palletId: '',
                uom: '',
                remarks: '',
              }])}
            >Add Row</button>
            <span className="text-gray-600 text-sm">Click to add more line items.</span>
            <button
              type="button"
              className="bg-green-600 text-white px-3 py-1 rounded shadow font-semibold"
              onClick={() => {
                setShowPasteArea(true);
                setTimeout(() => pasteTextareaRef.current?.focus(), 100);
              }}
            >Paste from Excel</button>
            {showPasteArea && (
              <textarea
                ref={pasteTextareaRef}
                onPaste={handlePaste}
                onBlur={() => setShowPasteArea(false)}
                rows={3}
                className="border rounded p-2 text-sm"
                placeholder="Paste here (Ctrl+V)..."
                style={{ minWidth: 300 }}
              />
            )}
            <span className="text-gray-600 text-sm">Tip: Use the button to paste multi-cell data from Excel or Google Sheets.</span>
          </div>
          <div className="ag-theme-alpine" style={{ width: '100%', minWidth: 0, height: 400, background: '#fff', border: '2px solid #d1d5db', borderRadius: '8px', padding: '8px' }}>
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              onCellValueChanged={params => {
                const rowIndex = params.node?.rowIndex;
                if (rowIndex !== null && rowIndex !== undefined) {
                  const updatedRows = [...rowData];
                  updatedRows[rowIndex] = params.data;
                  setRowData(updatedRows);
                }
              }}
              stopEditingWhenCellsLoseFocus={true}
              suppressRowClickSelection={true}
              rowSelection='multiple'
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Tip: Select the first cell, then paste (Ctrl+V) your multi-cell data from Excel or Google Sheets. AG Grid will fill the range automatically.
          </div>
        </div>
      </div>

      {/* Record View Grids */}
      <div className="w-full bg-white rounded-lg border shadow p-6 flex flex-row gap-6 mt-8" style={{ width: '100%', minWidth: 0 }}>
        {/* ASN Headers (left column, 30%) */}
        <div className="min-w-0" style={{ flexBasis: '30%', maxWidth: '30%', minWidth: 0 }}>
          {/* Status dropdown and Save button above grid */}
          <div className="flex items-center justify-between mb-2">
            <select className="border px-2 py-1 rounded" style={{ minWidth: 120 }}>
              <option value="New">New</option>
              <option value="Received">Received</option>
              <option value="PutAway">PutAway</option>
              <option value="Complete">Complete</option>
            </select>
            <button className="bg-blue-600 text-white px-3 py-1 rounded shadow font-semibold ml-2">Save</button>
          </div>
          <div className="ag-theme-alpine" style={{ width: '100%', minWidth: 0, height: 300 }}>
            <AgGridReact
              rowData={headerRecords}
              columnDefs={headerRecordCols}
              defaultColDef={{ resizable: true, sortable: true, filter: true, editable: true }}
              suppressRowClickSelection={true}
              rowSelection="single"
            />
          </div>
        </div>
        {/* Inbound Records (right column, 70%) */}
        <div className="min-w-0" style={{ flexBasis: '70%', maxWidth: '70%', minWidth: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">Inbound Records</h2>
            <input type="text" placeholder="Search..." className="border px-2 py-1 rounded ml-4" style={{ minWidth: 200 }} />
          </div>
          <div className="ag-theme-alpine" style={{ width: '100%', minWidth: 0, height: 300 }}>
            <AgGridReact
              rowData={lineRecords}
              columnDefs={lineRecordCols}
              defaultColDef={{ resizable: true, sortable: true, filter: true, editable: true }}
              suppressRowClickSelection={true}
              rowSelection="multiple"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
