"use client";
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { ASNBarcode } from './ASNBarcode';
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

// AG Grid columnDefs for entry grid
const columnDefs = [
  { headerName: '', field: 'selected', checkboxSelection: true, width: 40 },
  { headerName: 'Item ID', field: 'itemId', editable: true },
  { headerName: 'Item Description', field: 'itemDescription', editable: true },
  { headerName: 'Expected Qty', field: 'expectedQuantity', editable: true },
  { headerName: 'Received Qty', field: 'receivedQuantity', editable: true },
  { headerName: 'Batch #', field: 'batchNumber', editable: true },
  { headerName: 'Serial #', field: 'serialNumber', editable: true },
  {
    headerName: 'Mfg Date',
    field: 'manufacturingDate',
    editable: true,
    cellEditor: 'agDatePicker',
    cellEditorParams: {
      // Optionally set min/max date
    },
    valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleDateString() : '',
  },
  {
    headerName: 'Expiry Date',
    field: 'expiryDate',
    editable: true,
    cellEditor: 'agDatePicker',
    cellEditorParams: {
      // Optionally set min/max date
    },
    valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleDateString() : '',
  },
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
            // State for ASN lines update feedback
            const [linesUpdateStatus, setLinesUpdateStatus] = useState<string | null>(null);

            // Handler to update ASN lines in backend
            const handleUpdateLines = async () => {
              setLinesUpdateStatus(null);
              if (!selectedHeaderId) {
                setLinesUpdateStatus('No ASN header selected.');
                return;
              }
              const linesToUpdate = lineRecords.filter(line => line.asn_header_id === selectedHeaderId);
              if (linesToUpdate.length === 0) {
                setLinesUpdateStatus('No ASN lines to update.');
                return;
              }
              try {
                for (const line of linesToUpdate) {
                  // Only send editable fields for PATCH
                  const lineToSend = {
                    item_id: line.item_id,
                    item_description: line.item_description,
                    expected_quantity: line.expected_quantity,
                    received_quantity: line.received_quantity,
                    batch_number: line.batch_number,
                    serial_number: line.serial_number,
                    manufacturing_date: line.manufacturing_date,
                    expiry_date: line.expiry_date,
                    pallet_id: line.pallet_id,
                    uom: line.uom,
                    remarks: line.remarks ?? ''
                  };
                  const patchUrl = `${urlLines}?id=eq.${line.id}`;
                  console.log('PATCH ASN line:', { url: patchUrl, payload: lineToSend });
                  const res = await fetch(patchUrl, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-Api-Key': apiKey,
                    },
                    body: JSON.stringify(lineToSend),
                  });
                  const resText = await res.text();
                  console.log('PATCH response:', { status: res.status, text: resText });
                  if (!res.ok) {
                    setLinesUpdateStatus(`Failed to update ASN line ${line.id}. Status: ${res.status}. Response: ${resText}`);
                    return;
                  }
                }
                setLinesUpdateStatus('ASN lines updated successfully!');
                // Re-fetch ASN lines from backend to update grid
                try {
                  const linesRes = await fetch(urlLines, { method: 'GET', headers: { 'X-Api-Key': apiKey } });
                  const linesData = await linesRes.json();
                  setLineRecords(Array.isArray(linesData) ? linesData : [linesData]);
                } catch (err) {
                  // Optionally handle fetch error
                }
              } catch (err: any) {
                setLinesUpdateStatus(`Error: ${err.message}`);
              }
            };
          // Track selected ASN header id for filtering lines
          const [selectedHeaderId, setSelectedHeaderId] = useState<string | null>(null);
        // Ref for ASN headers grid
        const headerGridRef = useRef<any>(null);
        // State for delete feedback
        const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

        // Handler to delete selected ASN headers
        const handleDeleteSelectedHeaders = async () => {
          setDeleteStatus(null);
          const selectedNodes = headerGridRef.current?.api.getSelectedNodes() || [];
          const selectedIds = selectedNodes.map((node: any) => node.data.id);
          if (selectedIds.length === 0) {
            setDeleteStatus('No ASN headers selected.');
            return;
          }
          try {
            // Delete ASN headers
            for (const id of selectedIds) {
              const res = await fetch(`/api/asn_headers?id=${id}`, {
                method: 'DELETE',
                headers: {
                  'X-Api-Key': apiKey,
                },
              });
              if (!res.ok) {
                setDeleteStatus(`Failed to delete ASN header ${id}. Status: ${res.status}`);
                return;
              }
            }
            // Cascade delete ASN lines for each header
            for (const headerId of selectedIds) {
              const res = await fetch(`/api/asn_lines?asn_header_id=${headerId}`, {
                method: 'DELETE',
                headers: {
                  'X-Api-Key': apiKey,
                },
              });
              if (!res.ok) {
                setDeleteStatus(`Failed to delete ASN lines for header ${headerId}. Status: ${res.status}`);
                return;
              }
            }
            // Remove deleted headers and lines from UI
            setHeaderRecords(prev => prev.filter(rec => !selectedIds.includes(rec.id)));
            setLineRecords(prev => prev.filter(line => !selectedIds.includes(line.asn_header_id)));
            setDeleteStatus('Selected ASN headers and related ASN lines deleted successfully!');
          } catch (err: any) {
            setDeleteStatus(`Error: ${err.message}`);
          }
        };
      // State for unified ASN entry submission feedback
      const [entrySubmitStatus, setEntrySubmitStatus] = useState<string | null>(null);

      // Unified handler for ASN header and lines submission
      const handleSubmitEntry = async () => {
        setEntrySubmitStatus(null);
        // Validate ASN Date
        if (!header.asnDate) {
          setEntrySubmitStatus('ASN Date is required. Please select a valid date.');
          return;
        }
        // Prepare ASN header payload
        const headerId = uuidv4();
        const asnHeaderPayload = {
          id: headerId,
          asn_number: header.asnNumber,
          vendor_id: header.vendorId,
          vendor_name: header.vendorName,
          po_number: header.poNumber,
          asn_date: header.asnDate,
          status: header.status || 'New',
          remarks: header.remarks
        };
        // Prepare ASN lines payload
        const filteredRows = rowData.filter(row => row.itemId && row.itemId.trim() !== '');
        const asnLinesPayload = filteredRows.map(row => ({
          id: uuidv4(),
          item_id: row.itemId,
          item_description: row.itemDescription,
          expected_quantity: row.expectedQuantity ? Number(row.expectedQuantity) : null,
          received_quantity: row.receivedQuantity ? Number(row.receivedQuantity) : null,
          batch_number: row.batchNumber || null,
          serial_number: row.serialNumber || null,
          manufacturing_date: row.manufacturingDate ? row.manufacturingDate.slice(0, 10) : null,
          expiry_date: row.expiryDate ? row.expiryDate.slice(0, 10) : null,
          pallet_id: row.palletId || null,
          uom: row.uom || null,
          remarks: row.remarks || null,
          asn_header_id: headerId,
        }));
        if (asnLinesPayload.length === 0) {
          setEntrySubmitStatus('No valid ASN line items to submit.');
          return;
        }
        try {
          // 1. Insert ASN header
          const headerRes = await fetch(urlHeaders, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': apiKey,
            },
            body: JSON.stringify(asnHeaderPayload),
          });
          const headerText = await headerRes.text();
          if (!headerRes.ok) {
            setEntrySubmitStatus(`Header insert failed: ${headerRes.status} - ${headerText.slice(0, 500)}`);
            return;
          }
          // 2. Insert ASN lines
          const linesRes = await fetch(urlLines, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': apiKey,
            },
            body: JSON.stringify(asnLinesPayload),
          });
          const linesText = await linesRes.text();
          if (!linesRes.ok) {
            setEntrySubmitStatus(`Lines insert failed: ${linesRes.status} - ${linesText.slice(0, 500)}`);
            return;
          }
          setEntrySubmitStatus('ASN entry (header + lines) submitted successfully!');
        } catch (err: any) {
          setEntrySubmitStatus(`Error: ${err.message}`);
        }
      };
    // Record view state
    const [headerRecords, setHeaderRecords] = useState<any[]>([]);
    const [lineRecords, setLineRecords] = useState<any[]>([]);

    // Fetch ASN headers and lines for record view
      useEffect(() => {
        async function fetchRecords() {
          try {
            const headersRes = await fetch(urlHeaders, { method: 'GET', headers: { 'X-Api-Key': apiKey } });
            const headersData = await headersRes.json();
            console.log('ASN Headers Data:', headersData); // Debug log
            setHeaderRecords(Array.isArray(headersData) ? headersData : [headersData]);
            const linesRes = await fetch(urlLines, { method: 'GET', headers: { 'X-Api-Key': apiKey } });
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
      { headerName: 'ID', field: 'id', editable: false },
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
  ];
  const pasteTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [header, setHeader] = useState<ASNHeader>({
    asnNumber: '',
    vendorId: '',
    vendorName: '',
    poNumber: '',
    asnDate: '',
    status: '',
    remarks: '',
  });
  const [clientReady, setClientReady] = useState(false);

  // Auto-generate ASN and vendorId only on client after mount
  useEffect(() => {
    setHeader(h => ({
      ...h,
      asnNumber: uuidv4(),
      vendorId: uuidv4(),
    }));
    setClientReady(true);
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
        expected_quantity: row.expectedQuantity ? Number(row.expectedQuantity) : null,
        received_quantity: row.receivedQuantity ? Number(row.receivedQuantity) : null,
        batch_number: row.batchNumber || null,
        serial_number: row.serialNumber || null,
        manufacturing_date: row.manufacturingDate ? row.manufacturingDate.slice(0, 10) : null,
        expiry_date: row.expiryDate ? row.expiryDate.slice(0, 10) : null,
        pallet_id: row.palletId || null,
        uom: row.uom || null,
        remarks: row.remarks || null,
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
      // Debug: console.log ASN lines payload
      console.log('ASN lines payload with header:', asnLinesPayloadWithHeader);
      const linesRes = await fetch(urlLines, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
        },
        body: JSON.stringify(asnLinesPayloadWithHeader),
      });

      const linesText = await linesRes.text();
      // Debug: log response
      console.log('ASN lines response:', { payload: asnLinesPayloadWithHeader, response: linesText, status: linesRes.status });
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
      setTimeout(() => {
        window.location.reload();
      }, 1200);
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
            {clientReady && (
              <></>
            )}
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

          {/* Unified Save ASN Entry Button */}
          <div className="mt-4">
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded shadow font-semibold"
              onClick={handleSubmitEntry}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save ASN Entry'}
            </button>
            {entrySubmitStatus && (
              <div className="mt-2 text-sm font-semibold p-2 rounded" style={{ background: '#f3f4f6', color: entrySubmitStatus.startsWith('Error') || entrySubmitStatus.includes('failed') ? '#dc2626' : '#059669' }}>
                {entrySubmitStatus}
              </div>
            )}
          </div>

          {/* Error message display */}
          {error && (
  <div className="mb-2 text-red-600 font-semibold border border-red-400 bg-red-100 p-2 rounded">
    Error: {error}
    <br />
    <span className="text-xs">Check your .env.local, API key, and backend status. See browser console for details.</span>
  </div>
)}
        </div>

        {/* AG Grid Entry (right column, 70%) */}
        <div className="min-w-0" style={{ flexBasis: '70%', maxWidth: '70%', minWidth: 0 }}>
          {/* Add Row & Paste Buttons above grid */}
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              className="bg-blue-500 text-white px-3 py-1 rounded shadow font-semibold"
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                setRowData([...rowData, {
                  itemId: '',
                  itemDescription: '',
                  expectedQuantity: '',
                  receivedQuantity: '',
                  batchNumber: '',
                  serialNumber: '',
                  manufacturingDate: today,
                  expiryDate: today,
                  palletId: '',
                  uom: '',
                  remarks: '',
                }]);
              }}
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
              onCellValueChanged={async params => {
                const rowIndex = params.node?.rowIndex;
                if (rowIndex !== null && rowIndex !== undefined) {
                  const updatedRows = [...rowData];
                  const today = new Date().toISOString().slice(0, 10);
                  const data = { ...params.data };
                  if (data.itemId && (!data.manufacturingDate || !data.expiryDate)) {
                    if (!data.manufacturingDate) data.manufacturingDate = today;
                    if (!data.expiryDate) data.expiryDate = today;
                  }
                  updatedRows[rowIndex] = data;
                  setRowData(updatedRows);
                  // PATCH update for this row
                  if (data.id) {
                    // Map AG Grid fields to DB columns
                    const lineToSend = {
                      item_id: data.itemId ?? data.item_id,
                      item_description: data.itemDescription ?? data.item_description,
                      expected_quantity: data.expectedQuantity ?? data.expected_quantity,
                      received_quantity: data.receivedQuantity ?? data.received_quantity,
                      batch_number: data.batchNumber ?? data.batch_number,
                      serial_number: data.serialNumber ?? data.serial_number,
                      manufacturing_date: data.manufacturingDate ?? data.manufacturing_date,
                      expiry_date: data.expiryDate ?? data.expiry_date,
                      pallet_id: data.palletId ?? data.pallet_id,
                      uom: data.uom,
                      remarks: data.remarks ?? ''
                    };
                    const patchUrl = `${urlLines}?id=eq.${data.id}`;
                    console.log('PATCH ASN line (cell edit):', { url: patchUrl, payload: lineToSend });
                    const res = await fetch(patchUrl, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Key': apiKey,
                      },
                      body: JSON.stringify(lineToSend),
                    });
                    const resText = await res.text();
                    console.log('PATCH response (cell edit):', { status: res.status, text: resText });
                  }
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Inbound Records</h2>
            <div className="flex items-center gap-2">
              <select className="border px-2 py-1 rounded" style={{ minWidth: 120 }}>
                <option value="New">New</option>
                <option value="Received">Received</option>
                <option value="PutAway">PutAway</option>
                <option value="Complete">Complete</option>
              </select>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded shadow font-semibold"
                onClick={async () => {
                  if (!selectedHeaderId) return;
                  // Find the selected header
                  const header = headerRecords.find(h => h.id === selectedHeaderId);
                  if (!header) return;
                  // Prepare header PATCH payload
                  const headerToSend = {
                    asn_number: header.asn_number,
                    vendor_id: header.vendor_id,
                    vendor_name: header.vendor_name,
                    po_number: header.po_number,
                    asn_date: header.asn_date,
                    status: header.status,
                    remarks: header.remarks ?? ''
                  };
                  const patchHeaderUrl = `${urlHeaders}?id=eq.${header.id}`;
                  console.log('PATCH ASN header:', { url: patchHeaderUrl, payload: headerToSend });
                  const headerRes = await fetch(patchHeaderUrl, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-Api-Key': apiKey,
                    },
                    body: JSON.stringify(headerToSend),
                  });
                  const headerResText = await headerRes.text();
                  console.log('PATCH header response:', { status: headerRes.status, text: headerResText });
                  // Now PATCH all lines for this header
                  const linesToUpdate = lineRecords.filter(line => line.asn_header_id === selectedHeaderId);
                  for (const line of linesToUpdate) {
                    const lineToSend = {
                      item_id: line.item_id,
                      item_description: line.item_description,
                      expected_quantity: line.expected_quantity,
                      received_quantity: line.received_quantity,
                      batch_number: line.batch_number,
                      serial_number: line.serial_number,
                      manufacturing_date: line.manufacturing_date,
                      expiry_date: line.expiry_date,
                      pallet_id: line.pallet_id,
                      uom: line.uom,
                      remarks: line.remarks ?? ''
                    };
                    const patchLineUrl = `${urlLines}?id=eq.${line.id}`;
                    console.log('PATCH ASN line:', { url: patchLineUrl, payload: lineToSend });
                    const lineRes = await fetch(patchLineUrl, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Key': apiKey,
                      },
                      body: JSON.stringify(lineToSend),
                    });
                    const lineResText = await lineRes.text();
                    console.log('PATCH line response:', { status: lineRes.status, text: lineResText });
                  }
                  // Optionally re-fetch records to refresh UI
                  try {
                    const headersRes = await fetch(urlHeaders, { method: 'GET', headers: { 'X-Api-Key': apiKey } });
                    const headersData = await headersRes.json();
                    setHeaderRecords(Array.isArray(headersData) ? headersData : [headersData]);
                    const linesRes = await fetch(urlLines, { method: 'GET', headers: { 'X-Api-Key': apiKey } });
                    const linesData = await linesRes.json();
                    setLineRecords(Array.isArray(linesData) ? linesData : [linesData]);
                  } catch (err) {}
                }}
              >Save</button>
            </div>
          </div>
          <div className="ag-theme-alpine" style={{ width: '100%', minWidth: 0, height: 300 }}>
            <AgGridReact
              ref={headerGridRef}
              rowData={headerRecords}
              columnDefs={[
                { headerName: '', field: 'selected', checkboxSelection: true, width: 40 },
                { headerName: 'ID', field: 'id', editable: false, width: 220 },
                {
                  headerName: 'Status',
                  field: 'status',
                  editable: true,
                  cellEditor: 'agSelectCellEditor',
                  cellEditorParams: {
                    values: ['New', 'Received', 'PutAway', 'Complete'],
                  },
                  width: 120,
                },
                ...headerRecordCols.filter(col => col.field !== 'status' && col.field !== 'id'),
              ]}
              defaultColDef={{ resizable: true, sortable: true, filter: true, editable: true }}
              suppressRowClickSelection={true}
              rowSelection="single"
              onRowClicked={params => {
                if (params.data && params.data.id) {
                  setSelectedHeaderId(params.data.id);
                  const filteredLines = lineRecords.filter(line => line.asn_header_id === params.data.id);
                  console.log('Row clicked. Selected ASN Header ID:', params.data.id);
                  console.log('Filtered ASN Lines:', filteredLines);
                }
              }}
              onCellValueChanged={async params => {
                const data = params.data;
                if (data.id) {
                  setHeaderRecords(prev => {
                    const updated = prev.map(header =>
                      header.id === data.id
                        ? {
                            ...header,
                            asn_number: data.asn_number ?? data.asnNumber ?? '',
                            vendor_id: data.vendor_id ?? data.vendorId ?? '',
                            vendor_name: data.vendor_name ?? data.vendorName ?? '',
                            po_number: data.po_number ?? data.poNumber ?? '',
                            asn_date: (data.asn_date ?? data.asnDate) ? (data.asn_date ?? data.asnDate).slice(0, 10) : null,
                            status: data.status ?? '',
                            remarks: data.remarks ?? ''
                          }
                        : header
                    );
                    console.log('Before PATCH (header):', prev.find(header => header.id === data.id));
                    console.log('After PATCH (header):', updated.find(header => header.id === data.id));
                    return updated;
                  });
                  // Normalize AG Grid fields to DB columns and convert types
                  const headerToSend = {
                    asn_number: data.asn_number ?? data.asnNumber ?? '',
                    vendor_id: data.vendor_id ?? data.vendorId ?? '',
                    vendor_name: data.vendor_name ?? data.vendorName ?? '',
                    po_number: data.po_number ?? data.poNumber ?? '',
                    asn_date: (data.asn_date ?? data.asnDate) ? (data.asn_date ?? data.asnDate).slice(0, 10) : null,
                    status: data.status ?? '',
                    remarks: data.remarks ?? ''
                  };
                  const patchUrl = `${urlHeaders}?id=eq.${data.id}`;
                  console.log('PATCH ASN header (record grid):', { url: patchUrl, payload: headerToSend });
                  const res = await fetch(patchUrl, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-Api-Key': apiKey,
                    },
                    body: JSON.stringify(headerToSend),
                  });
                  const resText = await res.text();
                  console.log('PATCH response (header record grid):', { status: res.status, text: resText });
                  // Force grid refresh after PATCH
                  try {
                    const headersRes = await fetch(urlHeaders, { method: 'GET', headers: { 'X-Api-Key': apiKey } });
                    const headersData = await headersRes.json();
                    setHeaderRecords(Array.isArray(headersData) ? headersData : [headersData]);
                  } catch (err) {
                    // Optionally handle fetch error
                  }
                }
              }}
            />
            {/* Delete Selected Button */}
            <div className="mt-2">
              <button
                type="button"
                className="bg-red-600 text-white px-4 py-2 rounded shadow font-semibold"
                onClick={handleDeleteSelectedHeaders}
              >
                Delete Selected
              </button>
              {deleteStatus && (
                <div className="mt-2 text-sm font-semibold p-2 rounded" style={{ background: '#f3f4f6', color: deleteStatus.startsWith('Error') || deleteStatus.startsWith('Failed') ? '#dc2626' : '#059669' }}>
                  {deleteStatus}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Inbound Records (right column, 70%) */}
        <div className="min-w-0" style={{ flexBasis: '70%', maxWidth: '70%', minWidth: 0 }}>
          <div className="flex items-center justify-between mb-2">
            {/* <h2 className="text-xl font-bold">Inbound Records</h2> */}
            <input type="text" placeholder="Search..." className="border px-2 py-1 rounded ml-4" style={{ minWidth: 200 }} />
          </div>
          <div className="ag-theme-alpine" style={{ width: '100%', minWidth: 0, height: 300 }}>
            <AgGridReact
              rowData={selectedHeaderId ? lineRecords.filter(line => line.asn_header_id === selectedHeaderId) : lineRecords}
              columnDefs={lineRecordCols}
              defaultColDef={{ resizable: true, sortable: true, filter: true, editable: true }}
              suppressRowClickSelection={true}
              rowSelection="multiple"
              key={selectedHeaderId + '-' + lineRecords.length}
              onCellValueChanged={async params => {
                const data = params.data;
                if (data.id) {
                  // Update lineRecords with the new value
                  setLineRecords(prev => {
                    const updated = prev.map(line =>
                      line.id === data.id
                        ? {
                            ...line,
                            item_id: data.item_id ?? data.itemId ?? '',
                            item_description: data.item_description ?? data.itemDescription ?? '',
                            expected_quantity: data.expected_quantity !== undefined ? Number(data.expected_quantity) : (data.expectedQuantity !== undefined ? Number(data.expectedQuantity) : null),
                            received_quantity: data.received_quantity !== undefined ? Number(data.received_quantity) : (data.receivedQuantity !== undefined ? Number(data.receivedQuantity) : null),
                            batch_number: data.batch_number ?? data.batchNumber ?? '',
                            serial_number: data.serial_number ?? data.serialNumber ?? '',
                            manufacturing_date: (data.manufacturing_date ?? data.manufacturingDate) ? (data.manufacturing_date ?? data.manufacturingDate).slice(0, 10) : null,
                            expiry_date: (data.expiry_date ?? data.expiryDate) ? (data.expiry_date ?? data.expiryDate).slice(0, 10) : null,
                            pallet_id: data.pallet_id ?? data.palletId ?? '',
                            uom: data.uom ?? '',
                            remarks: data.remarks ?? '',
                          }
                        : line
                    );
                    console.log('Before PATCH:', prev.find(line => line.id === data.id));
                    console.log('After PATCH:', updated.find(line => line.id === data.id));
                    return updated;
                  });
                  // Normalize AG Grid fields to DB columns and convert types
                  const lineToSend = {
                    item_id: data.item_id ?? data.itemId ?? '',
                    item_description: data.item_description ?? data.itemDescription ?? '',
                    expected_quantity: data.expected_quantity !== undefined ? Number(data.expected_quantity) : (data.expectedQuantity !== undefined ? Number(data.expectedQuantity) : null),
                    received_quantity: data.received_quantity !== undefined ? Number(data.received_quantity) : (data.receivedQuantity !== undefined ? Number(data.receivedQuantity) : null),
                    batch_number: data.batch_number ?? data.batchNumber ?? '',
                    serial_number: data.serial_number ?? data.serialNumber ?? '',
                    manufacturing_date: (data.manufacturing_date ?? data.manufacturingDate) ? (data.manufacturing_date ?? data.manufacturingDate).slice(0, 10) : null,
                    expiry_date: (data.expiry_date ?? data.expiryDate) ? (data.expiry_date ?? data.expiryDate).slice(0, 10) : null,
                    pallet_id: data.pallet_id ?? data.palletId ?? '',
                    uom: data.uom ?? '',
                    remarks: data.remarks ?? ''
                  };
                  const patchUrl = `${urlLines}?id=eq.${data.id}`;
                  console.log('PATCH ASN line (record grid):', { url: patchUrl, payload: lineToSend });
                  const res = await fetch(patchUrl, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-Api-Key': apiKey,
                    },
                    body: JSON.stringify(lineToSend),
                  });
                  const resText = await res.text();
                  console.log('PATCH response (record grid):', { status: res.status, text: resText });
                  // Force grid refresh after PATCH
                  try {
                    const linesRes = await fetch(urlLines, { method: 'GET', headers: { 'X-Api-Key': apiKey } });
                    const linesData = await linesRes.json();
                    setLineRecords(Array.isArray(linesData) ? linesData : [linesData]);
                  } catch (err) {
                    // Optionally handle fetch error
                  }
                }
              }}
            />
            {/* Save ASN Lines Button */}
            <div className="mt-2">
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded shadow font-semibold"
                onClick={async () => {
                  // PATCH ASN header first
                  if (!selectedHeaderId) {
                    setLinesUpdateStatus('No ASN header selected.');
                    return;
                  }
                  const header = headerRecords.find(h => h.id === selectedHeaderId);
                  if (!header) {
                    setLinesUpdateStatus('Selected ASN header not found.');
                    return;
                  }
                  const headerToSend = {
                    asn_number: header.asn_number ?? header.asnNumber ?? '',
                    vendor_id: header.vendor_id ?? header.vendorId ?? '',
                    vendor_name: header.vendor_name ?? header.vendorName ?? '',
                    po_number: header.po_number ?? header.poNumber ?? '',
                    asn_date: (header.asn_date ?? header.asnDate) ? (header.asn_date ?? header.asnDate).slice(0, 10) : null,
                    status: header.status ?? '',
                    remarks: header.remarks ?? ''
                  };
                  const patchHeaderUrl = `${urlHeaders}?id=eq.${header.id}`;
                  console.log('PATCH ASN header (Update Records):', { url: patchHeaderUrl, payload: headerToSend });
                  const headerRes = await fetch(patchHeaderUrl, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-Api-Key': apiKey,
                    },
                    body: JSON.stringify(headerToSend),
                  });
                  const headerResText = await headerRes.text();
                  console.log('PATCH header response (Update Records):', { status: headerRes.status, text: headerResText });
                  // PATCH ASN lines
                  await handleUpdateLines();
                  // Optionally re-fetch records to refresh UI
                  try {
                    const headersRes = await fetch(urlHeaders, { method: 'GET', headers: { 'X-Api-Key': apiKey } });
                    const headersData = await headersRes.json();
                    setHeaderRecords(Array.isArray(headersData) ? headersData : [headersData]);
                  } catch (err) {}
                }}
              >
                Update Records
              </button>
              {linesUpdateStatus && (
                <div className="mt-2 text-sm font-semibold p-2 rounded" style={{ background: '#f3f4f6', color: linesUpdateStatus.startsWith('Error') || linesUpdateStatus.startsWith('Failed') ? '#dc2626' : '#059669' }}>
                  {linesUpdateStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
