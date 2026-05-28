'use client'

import { useState, useCallback, useEffect } from 'react'
import { getProducts, addProduct, updateProduct, deleteProduct, getShops, addShop, updateShop, deleteShop } from '@/lib/storage'
import { Product, Shop } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const CATEGORIES = ['Dining', 'Living', 'Bedroom', 'Office', 'Outdoor', 'Storage', 'Other']
const BRANDS = ['Ramehs Furniture', 'Fabrionic', 'Kale']
const AVAILABLE_LOGOS = [
  { path: '/brands/realplastlogo.png', label: 'Real Plast' },
  { path: '/brands/kaka.png', label: 'Kaka' },
  { path: '/brands/syntax.png', label: 'Syntax' },
]

export default function AdminPage() {
  const [tab, setTab] = useState<'products' | 'shops'>('shops')

  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [mounted, setMounted] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [price, setPrice] = useState('')
  const [brand, setBrand] = useState(BRANDS[0])

  // Shops state
  const [shops, setShops] = useState<Shop[]>([])
  const [editingShopId, setEditingShopId] = useState<string | null>(null)
  const [shopName, setShopName] = useState('')
  const [shopContactPerson, setShopContactPerson] = useState('')
  const [shopPhone, setShopPhone] = useState('')
  const [shopEmail, setShopEmail] = useState('')
  const [shopWebsite, setShopWebsite] = useState('')
  const [shopAddress, setShopAddress] = useState('')
  const [shopShowLogos, setShopShowLogos] = useState(true)
  const [shopLogoUrls, setShopLogoUrls] = useState<string[]>([])

  const refreshProducts = useCallback(() => setProducts(getProducts()), [])
  const refreshShops = useCallback(() => setShops(getShops()), [])

  useEffect(() => {
    refreshProducts()
    refreshShops()
    setMounted(true)
  }, [refreshProducts, refreshShops])

  // Product handlers
  const handleSaveProduct = useCallback(() => {
    if (!name.trim() || !price) return
    const productData = { name: name.trim(), category, price: parseFloat(price), brand }
    if (editingId) {
      updateProduct(editingId, productData)
      setEditingId(null)
    } else {
      addProduct({ ...productData, id: uuidv4() })
    }
    setName('')
    setCategory(CATEGORIES[0])
    setPrice('')
    refreshProducts()
  }, [name, category, price, brand, editingId, refreshProducts])

  const handleEditProduct = useCallback((product: Product) => {
    setEditingId(product.id)
    setName(product.name)
    setCategory(product.category)
    setPrice(product.price.toString())
    setBrand(product.brand || BRANDS[0])
  }, [])

  const handleCancelProduct = useCallback(() => {
    setEditingId(null)
    setName('')
    setCategory(CATEGORIES[0])
    setPrice('')
    setBrand(BRANDS[0])
  }, [])

  const handleDeleteProduct = useCallback((id: string) => {
    if (confirm('Delete this product?')) {
      deleteProduct(id)
      refreshProducts()
    }
  }, [refreshProducts])

  // Shop handlers
  const toggleLogo = useCallback((path: string) => {
    setShopLogoUrls(prev =>
      prev.includes(path) ? prev.filter(l => l !== path) : [...prev, path]
    )
  }, [])

  const handleSaveShop = useCallback(() => {
    if (!shopName.trim()) return
    const shopData: Shop = {
      name: shopName.trim(),
      contactPerson: shopContactPerson.trim(),
      phone: shopPhone.trim(),
      email: shopEmail.trim(),
      website: shopWebsite.trim(),
      address: shopAddress.trim(),
      showLogos: shopShowLogos,
      logoUrls: shopLogoUrls,
    }
    if (editingShopId) {
      updateShop(editingShopId, shopData)
      setEditingShopId(null)
    } else {
      addShop({ ...shopData, id: uuidv4() })
    }
    resetShopForm()
    refreshShops()
  }, [shopName, shopContactPerson, shopPhone, shopEmail, shopWebsite, shopAddress, shopShowLogos, shopLogoUrls, editingShopId, refreshShops])

  const handleEditShop = useCallback((shop: Shop) => {
    setEditingShopId(shop.id || null)
    setShopName(shop.name)
    setShopContactPerson(shop.contactPerson)
    setShopPhone(shop.phone)
    setShopEmail(shop.email)
    setShopWebsite(shop.website)
    setShopAddress(shop.address || '')
    setShopShowLogos(shop.showLogos)
    setShopLogoUrls(shop.logoUrls || [])
  }, [])

  const resetShopForm = useCallback(() => {
    setEditingShopId(null)
    setShopName('')
    setShopContactPerson('')
    setShopPhone('')
    setShopEmail('')
    setShopWebsite('')
    setShopAddress('')
    setShopShowLogos(true)
    setShopLogoUrls([])
  }, [])

  const handleDeleteShop = useCallback((id: string) => {
    if (confirm('Delete this shop? Existing quotations will not be affected.')) {
      deleteShop(id)
      refreshShops()
    }
  }, [refreshShops])

  if (!mounted) {
    return (
      <div className="main-content">
        <div className="skeleton-tabs">
          <div className="skeleton skeleton-tab" />
          <div className="skeleton skeleton-tab" />
        </div>
        <div className="skeleton-card">
          <div className="skeleton skeleton-title" />
          <div className="skeleton-form">
            <div className="skeleton-form-full"><div className="skeleton skeleton-block" /></div>
            <div className="skeleton skeleton-block" />
            <div className="skeleton skeleton-block" />
            <div className="skeleton skeleton-block" />
            <div className="skeleton skeleton-block" />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="skeleton" style={{ height: '40px', width: '120px' }} />
          </div>
        </div>
        <div className="skeleton-card">
          <div className="skeleton skeleton-title" />
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-table-row">
              <div className="skeleton skeleton-circle" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-btn" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button className={`admin-tab-btn ${tab === 'shops' ? 'active' : ''}`} onClick={() => setTab('shops')}>
          Shops
        </button>
        <button className={`admin-tab-btn ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
          Products
        </button>
      </div>

      {/* ===== SHOPS TAB ===== */}
      {tab === 'shops' && (
        <>
          <h2 className="section-title">Manage Shops</h2>

          {/* Add/Edit Shop Form */}
          <div className="card">
            <div className="shop-form-grid">
              <div className="form-group shop-form-full">
                <label>Shop / Company Name *</label>
                <input type="text" className="form-input" placeholder="e.g. Ananya House of Furniture" value={shopName} onChange={e => setShopName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Contact Person</label>
                <input type="text" className="form-input" placeholder="e.g. Bharat Prajapati" value={shopContactPerson} onChange={e => setShopContactPerson(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" className="form-input" placeholder="e.g. +91 9099917211" value={shopPhone} onChange={e => setShopPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-input" placeholder="e.g. info@shop.com" value={shopEmail} onChange={e => setShopEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input type="text" className="form-input" placeholder="e.g. www.shop.com" value={shopWebsite} onChange={e => setShopWebsite(e.target.value)} />
              </div>
              <div className="form-group shop-form-full">
                <label>Address</label>
                <input type="text" className="form-input" placeholder="e.g. 123, Main Road, City, State" value={shopAddress} onChange={e => setShopAddress(e.target.value)} />
              </div>
            </div>

            {/* Show Logos Toggle */}
            <div className="form-group" style={{ marginTop: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                <input type="checkbox" checked={shopShowLogos} onChange={e => setShopShowLogos(e.target.checked)} />
                Show brand logos on PDF
              </label>
            </div>

            {/* Logo Selection */}
            {shopShowLogos && (
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-light)', marginBottom: '8px', display: 'block' }}>Select Logos</label>
                <div className="logo-checkbox-grid">
                  {AVAILABLE_LOGOS.map(logo => (
                    <label key={logo.path} className={`logo-checkbox-item ${shopLogoUrls.includes(logo.path) ? 'selected' : ''}`}>
                      <input type="checkbox" checked={shopLogoUrls.includes(logo.path)} onChange={() => toggleLogo(logo.path)} style={{ display: 'none' }} />
                      {logo.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Preview */}
            {(shopContactPerson || shopPhone || shopEmail) && (
              <div className="shop-contact-preview">
                {shopContactPerson && <span>{shopContactPerson}</span>}
                {shopPhone && <span>{shopPhone}</span>}
                {shopEmail && <span>{shopEmail}</span>}
              </div>
            )}

            <div className="shop-form-actions">
              <button onClick={handleSaveShop}>
                {editingShopId ? 'Update Shop' : 'Add Shop'}
              </button>
              {editingShopId && (
                <button onClick={resetShopForm}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Shops List */}
          {shops.length === 0 ? (
            <p className="empty-state">No shops yet. Add your first shop above.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Shop Name</th>
                  <th>Contact</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Logos</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shops.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.contactPerson || '—'}</td>
                    <td>{s.phone || '—'}</td>
                    <td>{s.address || '—'}</td>
                    <td>
                      {s.showLogos && s.logoUrls.length > 0 ? (
                        <div className="logos-preview">
                          {s.logoUrls.map(l => (
                            <span key={l} className="logo-tag">
                              {AVAILABLE_LOGOS.find(al => al.path === l)?.label || l.split('/').pop()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#999', fontSize: '12px' }}>No logos</span>
                      )}
                    </td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEditShop(s)}>Edit</button>
                      <button className="btn-delete" onClick={() => s.id && handleDeleteShop(s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ===== PRODUCTS TAB ===== */}
      {tab === 'products' && (
        <>
          <h2 className="section-title">Products</h2>

          <div className="card">
            <div className="product-form">
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" className="form-input" placeholder="e.g. Wooden Dining Table" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Price (INR)</label>
                <input type="number" className="form-input" placeholder="0" min="0" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Brand</label>
                <select className="form-input" value={brand} onChange={e => setBrand(e.target.value)}>
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                <div className="form-actions">
                  <button onClick={handleSaveProduct}>{editingId ? 'Update Product' : 'Add Product'}</button>
                  {editingId && (
                    <button className="btn-cancel" onClick={handleCancelProduct}>Cancel</button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <p className="empty-state">No products yet. Add your first product above.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td>{p.name}</td>
                    <td><span className="category-badge">{p.category}</span></td>
                    <td><span className="category-badge">{p.brand || '—'}</span></td>
                    <td>&#8377;{parseFloat(p.price.toString()).toLocaleString('en-IN')}</td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEditProduct(p)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDeleteProduct(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </>
  )
}
