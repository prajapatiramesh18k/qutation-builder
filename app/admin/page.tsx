'use client'

import { useState, useCallback, useEffect } from 'react'
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/storage'
import { Product } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const CATEGORIES = ['Dining', 'Living', 'Bedroom', 'Office', 'Outdoor', 'Storage', 'Other']
const BRANDS = ['Ramehs Furniture', 'Fabrionic', 'Kale']

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [mounted, setMounted] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [price, setPrice] = useState('')
  const [brand, setBrand] = useState(BRANDS[0])

  const refresh = useCallback(() => {
    setProducts(getProducts())
  }, [])

  useEffect(() => {
    refresh()
    setMounted(true)
  }, [refresh])

  const handleSave = useCallback(() => {
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
    refresh()
  }, [name, category, price, brand, editingId, refresh])

  const handleEdit = useCallback((product: Product) => {
    setEditingId(product.id)
    setName(product.name)
    setCategory(product.category)
    setPrice(product.price.toString())
    setBrand(product.brand || BRANDS[0])
  }, [])

  const handleCancel = useCallback(() => {
    setEditingId(null)
    setName('')
    setCategory(CATEGORIES[0])
    setPrice('')
    setBrand(BRANDS[0])
  }, [])

  const handleDelete = useCallback((id: string) => {
    if (confirm('Delete this product?')) {
      deleteProduct(id)
      refresh()
    }
  }, [refresh])

  return (
    <>
      <h2 className="section-title">Products</h2>

      {/* Add/Edit Product Form */}
      <div className="card">
        <div className="product-form">
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Wooden Dining Table"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              className="form-input"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Price (INR)</label>
            <input
              type="number"
              className="form-input"
              placeholder="0"
              min="0"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Brand</label>
            <select
              className="form-input"
              value={brand}
              onChange={e => setBrand(e.target.value)}
            >
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <div className="form-actions">
              <button onClick={handleSave}>
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
              {editingId && (
                <button className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product List */}
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
                  <button className="btn-edit" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
