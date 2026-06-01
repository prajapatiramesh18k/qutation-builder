'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { getProducts, saveQuotation, getNextQuotationNumber, getShops } from '@/lib/storage'
import { generatePDF } from '@/utils/generatePDF'
import { QuotationItem, CustomerDetails, Quotation, Shop } from '@/types'

export default function QuotationPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [mounted, setMounted] = useState(false)
  const [selectedShopId, setSelectedShopId] = useState<string>('')
  const [customer, setCustomer] = useState<CustomerDetails>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
  })
  const [countryCode, setCountryCode] = useState('+91')

  const [items, setItems] = useState<QuotationItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState<string>('1')
  const [itemHeight, setItemHeight] = useState<number>(0)
  const [itemWidth, setItemWidth] = useState<number>(0)
  const [itemRate, setItemRate] = useState(0)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [gstPercent, setGstPercent] = useState(0)
  const [deliveryCharges, setDeliveryCharges] = useState(0)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const availableShops = getShops()
    setShops(availableShops)
    if (availableShops.length > 0 && !selectedShopId) {
      setSelectedShopId(availableShops[0].id || '')
    }
    setMounted(true)
  }, [])

  const selectedShop = useMemo(
    () => shops.find(s => s.id === selectedShopId) || shops[0] || null,
    [shops, selectedShopId]
  )

  const subtotal = useMemo(
    () => items.reduce((sum, item) => {
      if (item.rate && item.size) {
        const parts = item.size.split('×');
        const sqft = parts.length === 2 ? parseFloat(parts[0]) * parseFloat(parts[1]) : parseFloat(item.size.replace(/[^\d.]/g, ''));
        return sum + item.quantity * item.rate * sqft;
      }
      return sum + item.quantity * item.unitPrice;
    }, 0),
    [items]
  )
  const gstAmount = useMemo(() => (subtotal * gstPercent) / 100, [subtotal, gstPercent])
  const total = useMemo(() => subtotal + gstAmount + deliveryCharges, [subtotal, gstAmount, deliveryCharges])

  const handleAddItem = useCallback(() => {
    const qty = parseInt(quantity) || 1
    if (!selectedProductId || qty < 1) return
    const product = getProducts().find(p => p.id === selectedProductId)
    if (!product) return

    const size = itemHeight && itemWidth ? `${itemHeight}×${itemWidth}` : ''
    const newItem: QuotationItem = {
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: qty,
      brand: product.brand,
      size,
      rate: itemRate,
    }

    if (editingItemIndex !== null) {
      setItems(items.map((item, i) => i === editingItemIndex ? newItem : item))
      setEditingItemIndex(null)
    } else {
      setItems([...items, newItem])
    }
    setSelectedProductId('')
    setQuantity('1')
    setItemHeight(0)
    setItemWidth(0)
    setItemRate(0)
  }, [selectedProductId, quantity, items, itemHeight, itemWidth, itemRate, editingItemIndex])

  const handleEditItem = useCallback((index: number) => {
    const item = items[index]
    setSelectedProductId(item.productId)
    setQuantity(String(item.quantity))
    const parts = item.size ? item.size.split('×') : []
    setItemHeight(parts[0] ? parseFloat(parts[0]) : 0)
    setItemWidth(parts[1] ? parseFloat(parts[1]) : 0)
    setItemRate(item.rate || 0)
    setEditingItemIndex(index)
  }, [items])

  const handleCancelEdit = useCallback(() => {
    setSelectedProductId('')
    setQuantity('1')
    setItemHeight(0)
    setItemWidth(0)
    setItemRate(0)
    setEditingItemIndex(null)
  }, [])

  const handleRemoveItem = useCallback((index: number) => {
    setItems(items.filter((_, i) => i !== index))
    if (editingItemIndex === index) {
      handleCancelEdit()
    }
  }, [items, editingItemIndex, handleCancelEdit])

  const handleGeneratePDF = useCallback(async () => {
    if (!selectedShop) {
      alert('Please select a shop first.')
      return
    }
    if (!customer.customerName || !customer.customerPhone || items.length === 0) {
      alert('Please fill customer details and add at least one product.')
      return
    }
    if (!/^\d{10}$/.test(customer.customerPhone)) {
      alert('Please enter a valid 10-digit mobile number.')
      return
    }
    const quotationNumber = `Q${Date.now()}`
    const displayNumber = `Q${getNextQuotationNumber(selectedShop.id || 'default').toString().padStart(4, '0')}`
    await generatePDF({
      customer,
      items,
      subtotal,
      gstPercent,
      gstAmount,
      deliveryCharges,
      total,
      notes,
    }, displayNumber, selectedShop)

    const quotation: Quotation = {
      id: quotationNumber,
      shopId: selectedShop.id || '',
      date: new Date().toISOString(),
      customerName: customer.customerName,
      customerPhone: customer.customerPhone,
      customerAddress: customer.customerAddress,
      items,
      subtotal,
      gstPercent,
      gstAmount,
      deliveryCharges,
      total,
      notes,
    }
    saveQuotation(quotation)

    setCustomer({ customerName: '', customerPhone: '', customerAddress: '' })
    setItems([])
    setNotes('')
    setDeliveryCharges(0)
    setGstPercent(0)
    alert('Quotation saved and PDF downloaded!')
  }, [customer, items, subtotal, gstPercent, gstAmount, deliveryCharges, total, notes, selectedShop])

  if (!mounted) {
    return (
      <div className="main-content" style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 16px' }}>
        <div className="skeleton-card">
          <div className="skeleton skeleton-hero">
            <div className="skeleton skeleton-hero-text">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" />
            </div>
            <div className="skeleton skeleton-hero-circle" />
          </div>
        </div>
        <div className="skeleton-card">
          <div className="skeleton skeleton-title" />
          <div className="skeleton-form">
            <div className="skeleton skeleton-block" />
            <div className="skeleton skeleton-block" />
            <div className="skeleton-form-full"><div className="skeleton skeleton-block" /></div>
          </div>
        </div>
        <div className="skeleton-card">
          <div className="skeleton skeleton-title" />
          <div className="skeleton-form">
            <div className="skeleton-form-full"><div className="skeleton skeleton-block" /></div>
            <div className="skeleton skeleton-block" />
            <div className="skeleton skeleton-block" />
            <div className="skeleton skeleton-block" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Shop Selector */}
      <div className="card">
        <h3>Select Shop</h3>
        <select
          className="form-input"
          value={selectedShopId}
          onChange={e => setSelectedShopId(e.target.value)}
          style={{ maxWidth: '400px' }}
        >
          <option value="">Select a shop</option>
          {shops.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {selectedShop && (
          <div className="shop-contact-preview">
            {selectedShop.contactPerson && <span>{selectedShop.contactPerson}</span>}
            {selectedShop.phone && <span>{selectedShop.phone}</span>}
            {selectedShop.email && <span>{selectedShop.email}</span>}
            {selectedShop.address && <span>{selectedShop.address}</span>}
          </div>
        )}
      </div>

      {/* Customer Details */}
      <div className="card">
        <h3>Customer Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Customer Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter customer name"
              value={customer.customerName}
              onChange={e => setCustomer({ ...customer, customerName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Phone Number *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                className="form-input"
                style={{ width: '90px', flexShrink: 0 }}
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
              >
                <option value="+91">+91</option>
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+61">+61 (AU)</option>
                <option value="+971">+971 (UAE)</option>
                <option value="+1-246">+1-246 (Barbados)</option>
                <option value="+880">+880 (BD)</option>
                <option value="+92">+92 (PK)</option>
                <option value="+94">+94 (LKA)</option>
                <option value="+975">+975 (BT)</option>
                <option value="+977">+977 (NP)</option>
                <option value="+960">+960 (MV)</option>
              </select>
              <input
                type="text"
                className="form-input"
                placeholder="Enter mobile number"
                value={customer.customerPhone}
                maxLength={15}
                onChange={e => setCustomer({ ...customer, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 15) })}
              />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter delivery address"
              value={customer.customerAddress}
              onChange={e => setCustomer({ ...customer, customerAddress: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Product Selector */}
      <div className="card">
        <h3>Add Products</h3>
        <div className="selector-row">
          <select
            className="form-input"
            value={selectedProductId}
            onChange={e => setSelectedProductId(e.target.value)}
          >
            <option value="">Select a product</option>
            {getProducts().map(p => (
              <option key={p.id} value={p.id}>
                {p.name} — &#8377;{p.price.toLocaleString('en-IN')} ({p.category})
              </option>
            ))}
          </select>
          <input
            type="number"
            className="form-input"
            placeholder="Height"
            min="0"
            value={itemHeight || ''}
            onChange={e => setItemHeight(parseFloat(e.target.value) || 0)}
            style={{ width: '70px' }}
          />
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e' }}>×</span>
          <input
            type="number"
            className="form-input"
            placeholder="Width"
            min="0"
            value={itemWidth || ''}
            onChange={e => setItemWidth(parseFloat(e.target.value) || 0)}
            style={{ width: '70px' }}
          />
          {itemHeight > 0 && itemWidth > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: 'var(--accent)', minWidth: '80px', fontSize: '13px' }}>
              = {itemHeight * itemWidth} Sq.Ft
            </span>
          )}
          <input
            type="number"
            className="form-input"
            placeholder="Rate"
            value={itemRate || ''}
            onChange={e => setItemRate(parseFloat(e.target.value) || 0)}
            style={{ width: '80px' }}
          />
          <input
            type="text"
            className="form-input qty-input"
            placeholder="Qty"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />
          <button onClick={handleAddItem} disabled={!selectedProductId}>
            {editingItemIndex !== null ? 'Update' : 'Add'}
          </button>
          {editingItemIndex !== null && (
            <button className="btn-cancel" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="card">
        <h3>Quotation Items</h3>
        {items.length === 0 ? (
          <p className="empty-state">No items added yet. Select products above to add them.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Size</th>
                <th>Sq.Ft</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const parts = item.size ? item.size.split('×') : [];
                const sqft = parts.length === 2 ? parseFloat(parts[0]) * parseFloat(parts[1]) : 0;
                const calcUnitPrice = (item.rate && item.size) ? item.rate * sqft : item.unitPrice;
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.productName}</td>
                    <td>{item.size || '-'}</td>
                    <td>{sqft > 0 ? sqft : '-'}</td>
                    <td>{item.quantity}</td>
                    <td>{item.rate ? '₹' + item.rate.toLocaleString('en-IN') : '-'}</td>
                    <td>&#8377;{(item.quantity * calcUnitPrice).toLocaleString('en-IN')}</td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEditItem(index)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleRemoveItem(index)}>Remove</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Notes */}
      <div className="card">
        <h3>Notes (Optional)</h3>
        <textarea
          rows={3}
          placeholder="Additional notes, terms, or delivery instructions..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      {/* Totals */}
      <div className="card">
        <h3>Totals</h3>
        <div className="totals-grid">
          <div className="total-row">
            <span>Subtotal</span>
            <span>&#8377;{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="total-row">
            <div className="total-input-group">
              <label>GST %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={gstPercent}
                onChange={e => setGstPercent(parseFloat(e.target.value) || 0)}
              />
            </div>
            <span>&#8377;{gstAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="total-row">
            <div className="total-input-group">
              <label>Delivery</label>
              <input
                type="number"
                min="0"
                value={deliveryCharges}
                onChange={e => setDeliveryCharges(parseFloat(e.target.value) || 0)}
              />
            </div>
            <span>&#8377;{deliveryCharges.toLocaleString('en-IN')}</span>
          </div>
          <div className="total-row grand-total">
            <span>Grand Total</span>
            <span>&#8377;{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Generate PDF */}
      <button className="btn-generate-pdf" onClick={handleGeneratePDF} disabled={!selectedShop}>
        Generate Quotation PDF
      </button>
    </>
  )
}
