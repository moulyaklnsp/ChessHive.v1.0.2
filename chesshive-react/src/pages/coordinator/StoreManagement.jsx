import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, addProduct } from '../../features/products/productsSlice';
// Using inline search UI here so we can increase input visibility specifically for coordinator
import '../../styles/playerNeoNoir.css';
import { motion } from 'framer-motion';
import usePlayerTheme from '../../hooks/usePlayerTheme';
import AnimatedSidebar from '../../components/AnimatedSidebar';

const VISIBLE_COUNT = 8;

const sectionVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.12,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

function StoreManagement() {
  const [isDark, toggleTheme] = usePlayerTheme();
  const dispatch = useDispatch();
  const productState = useSelector((s) => s.products || {});
  const [visible, setVisible] = useState(VISIBLE_COUNT);

  const [form, setForm] = useState({
    productName: '',
    productCategory: '',
    productPrice: '',
    productImage: '',
    availability: ''
  });
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: string }

  const [filter, setFilter] = useState({ search: '', category: '' });
  const productsList = useMemo(() => productState.products || [], [productState.products]);
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      if ((Number(p.availability) || 0) <= 0) return false;
      if (filter.category && String(p.category || '').toLowerCase() !== String(filter.category || '').toLowerCase()) return false;
      if (filter.search) {
        const s = filter.search.toLowerCase();
        return String(p.name || '').toLowerCase().includes(s) || String(p.category || '').toLowerCase().includes(s);
      }
      return true;
    });
  }, [productsList, filter]);

  const showMessage = (text, type = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  useEffect(() => {
    // Fetch products via Redux slice on mount
    dispatch(fetchProducts('coordinator'));
    setVisible(VISIBLE_COUNT);
  }, [dispatch]);

  const validate = () => {
    const errors = {};
    const name = form.productName.trim();
    const category = form.productCategory.trim();
    const price = parseFloat(form.productPrice);
    const imageUrl = form.productImage.trim();
    const availability = parseInt(form.availability);

    // Name
    if (!name) errors.productName = 'Product name is required.';
    else if (name.length < 3) errors.productName = 'Product name must be at least 3 characters long.';
    else if (!/^[a-zA-Z0-9\s\-&]+$/.test(name)) errors.productName = 'Only letters, numbers, spaces, hyphens, and & are allowed.';

    // Category
    if (!category) errors.productCategory = 'Product category is required.';
    else if (category.length < 3) errors.productCategory = 'Product category must be at least 3 characters long.';
    else if (!/^[a-zA-Z0-9\s\-&]+$/.test(category)) errors.productCategory = 'Only letters, numbers, spaces, hyphens, and & are allowed.';

    // Price
    if (isNaN(price)) errors.productPrice = 'Price is required.';
    else if (price < 0) errors.productPrice = 'Price cannot be negative.';

    // Image (either file OR URL)
    if (!productImageFile) {
      const isValidImg =
        imageUrl.startsWith('http://') ||
        imageUrl.startsWith('https://') ||
        (imageUrl.startsWith('data:image/') && imageUrl.includes(';base64,'));
      if (!imageUrl) errors.productImage = 'Upload an image or provide an Image URL.';
      else if (!isValidImg) errors.productImage = 'Provide a valid http/https URL or data:image base64 string.';
    }

    // Availability
    if (isNaN(availability)) errors.availability = 'Availability is required';
    else if (availability < 0) errors.availability = 'Availability cannot be negative.';
    else if (availability > 1000) errors.availability = 'Availability cannot exceed 1000.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showMessage('Please correct the errors in the form.', 'error');
      return;
    }
    const payload = {
      productName: form.productName.trim(),
      productCategory: form.productCategory.trim(),
      price: parseFloat(form.productPrice),
      imageUrl: form.productImage.trim(),
      availability: parseInt(form.availability)
    };
    try {
      const resultAction = await dispatch(addProduct({
        name: payload.productName,
        category: payload.productCategory,
        price: payload.price,
        imageUrl: payload.imageUrl,
        imageFile: productImageFile || undefined,
        availability: payload.availability,
      }));
      if (addProduct.rejected.match(resultAction)) throw new Error(resultAction.payload?.message || 'Failed to add product');
      await dispatch(fetchProducts('coordinator'));
      setForm({ productName: '', productCategory: '', productPrice: '', productImage: '', availability: '' });
      setProductImageFile(null);
      setProductImagePreview('');
      showMessage('Product added successfully!', 'success');
    } catch (err) {
      console.error('POST error:', err);
      showMessage(`Failed to add product: ${err.message}`, 'error');
    }
  };

  useEffect(() => {
    if (!productImageFile) {
      setProductImagePreview('');
      return;
    }
    const url = URL.createObjectURL(productImageFile);
    setProductImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [productImageFile]);

  const coordinatorLinks = [
    { path: '/coordinator/coordinator_profile', label: 'Profile', icon: 'fas fa-user' },
    { path: '/coordinator/tournament_management', label: 'Tournaments', icon: 'fas fa-trophy' },
    { path: '/coordinator/player_stats', label: 'Player Stats', icon: 'fas fa-chess' },
    { path: '/coordinator/streaming_control', label: 'Streaming Control', icon: 'fas fa-broadcast-tower' },
    { path: '/coordinator/store_management', label: 'Store', icon: 'fas fa-store' },
    { path: '/coordinator/coordinator_meetings', label: 'Meetings', icon: 'fas fa-calendar' },
    { path: '/coordinator/coordinator_chat', label: 'Live Chat', icon: 'fas fa-comments' }
  ];

  // Utility for safe image URLs
  const getImgSrc = (imgSrc) => {
    let isValid = false;
    if (imgSrc && (imgSrc.startsWith('http://') || imgSrc.startsWith('https://'))) isValid = true;
    else if (imgSrc && imgSrc.startsWith('data:image/') && imgSrc.includes(';base64,') && imgSrc.length > 100) isValid = true;
    return isValid ? imgSrc : '/images/placeholder.jpg';
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body, #root { min-height: 100vh; }
        .page { font-family: 'Playfair Display', serif; background-color: var(--page-bg); min-height: 100vh; display:flex; color: var(--text-color); }
        .content { flex-grow:1; margin-left:0; padding:2rem; }
        h1 { font-family:'Cinzel', serif; color:var(--sea-green); margin-bottom:2rem; font-size:2.5rem; display:flex; align-items:center; gap:1rem; }
        .updates-section { background:var(--card-bg); border-radius:15px; padding:2rem; margin-bottom:2rem; box-shadow:none; border:1px solid var(--card-border); transition: transform 0.3s ease; }
        .updates-section:hover { transform: translateY(-5px); }
        .form-group { margin-bottom: 1rem; }
        .form-label { font-family:'Cinzel', serif; color:var(--sea-green); margin-bottom:8px; display:block; }
        .form-input { width:100%; padding:0.8rem; border:2px solid var(--sea-green); border-radius:8px; font-family:'Playfair Display', serif; background:var(--card-bg); color:var(--text-color); }
        .form-input.error { border-color:#c62828; }
        .error-text { color:#c62828; font-size:0.9rem; margin-top:4px; }
        .btn-primary { background:var(--sea-green); color:var(--on-accent); border:none; padding:1rem; border-radius:8px; cursor:pointer; font-family:'Cinzel', serif; font-weight:bold; display:flex; align-items:center; gap:0.5rem; }
        .products-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); gap:2rem; margin-top:2rem; }
        .product-card { background:var(--card-bg); border-radius:15px; overflow:hidden; border:1px solid var(--card-border); }
        .product-img { width:100%; height:200px; overflow:hidden; }
        .product-img img { width:100%; height:100%; object-fit:cover; }
        .product-info { padding:1.5rem; }
        .product-price { color:var(--sea-green); font-weight:bold; margin-bottom:8px; }
        .product-available { color:var(--text-color); opacity:0.7; }
        .action-btn { display:inline-flex; align-items:center; gap:0.5rem; background:var(--sky-blue); color:var(--sea-green); text-decoration:none; padding:0.8rem 1.5rem; border-radius:8px; font-family:'Cinzel', serif; font-weight:bold; cursor:pointer; border:none; }
        .message { margin-bottom:1rem; padding:0.75rem 1rem; border-radius:8px; }
        .message.success { color:#1b5e20; background:rgba(76,175,80,0.15); }
        .message.error { color:#c62828; background:rgba(198,40,40,0.15); }
        .empty-state { text-align:center; padding:2rem; color:var(--sea-green); font-style:italic; background:var(--card-bg); border-radius:15px; margin-top:2rem; border:1px solid var(--card-border); }
      `}</style>

      <div className="page player-neo">
        <motion.div
          className="chess-knight-float"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.14, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 0, fontSize: '2.5rem', color: 'var(--sea-green)' }}
          aria-hidden="true"
        >
          <i className="fas fa-shopping-bag" />
        </motion.div>
        
        <AnimatedSidebar links={coordinatorLinks} logo={<i className="fas fa-chess" />} title={`ChessHive`} />

        <div className="coordinator-dash-header" style={{ position: 'fixed', top: 18, right: 18, zIndex: 1001, display: 'flex', gap: '12px', alignItems: 'center' }}>
          <motion.button
            type="button"
            onClick={toggleTheme}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              color: 'var(--text-color)',
              width: 40,
              height: 40,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.1rem'
            }}
          >
            <i className={isDark ? 'fas fa-sun' : 'fas fa-moon'} />
          </motion.button>
        </div>

        <div className="content">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <i className="fas fa-store" /> Store Management
          </motion.h1>

          <motion.div
            className="updates-section"
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            {message && (
              <div className={`message ${message.type}`}>
                <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} /> {message.text}
              </div>
            )}
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label className="form-label"><i className="fas fa-tag" /> Product Name:</label>
                <input
                  className={`form-input ${fieldErrors.productName ? 'error' : ''}`}
                  type="text"
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  required
                />
                {fieldErrors.productName && <div className="error-text">{fieldErrors.productName}</div>}
              </div>
              <div className="form-group">
                <label className="form-label"><i className="fas fa-tag" /> Product Category:</label>
                <input
                  className={`form-input ${fieldErrors.productCategory ? 'error' : ''}`}
                  type="text"
                  value={form.productCategory}
                  onChange={(e) => setForm({ ...form, productCategory: e.target.value })}
                  required
                />
                {fieldErrors.productCategory && <div className="error-text">{fieldErrors.productCategory}</div>}
              </div>
              <div className="form-group">
                <label className="form-label"><i className="fas fa-rupee-sign" /> Price:</label>
                <input
                  className={`form-input ${fieldErrors.productPrice ? 'error' : ''}`}
                  type="number"
                  step="0.01"
                  value={form.productPrice}
                  onChange={(e) => setForm({ ...form, productPrice: e.target.value })}
                  required
                />
                {fieldErrors.productPrice && <div className="error-text">{fieldErrors.productPrice}</div>}
              </div>
              <div className="form-group">
                <label className="form-label"><i className="fas fa-image" /> Product Image:</label>
                <input
                  className="form-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    setProductImageFile(f || null);
                  }}
                />
                {productImagePreview && (
                  <div style={{ marginTop: 10 }}>
                    <img src={productImagePreview} alt="Preview" style={{ width: 220, height: 140, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--card-border)' }} />
                  </div>
                )}
                <div style={{ marginTop: 10 }}>
                  <div style={{ opacity: 0.85, marginBottom: 6 }}>Or paste an Image URL (optional if you upload a file):</div>
                  <input
                    className={`form-input ${fieldErrors.productImage ? 'error' : ''}`}
                    type="text"
                    value={form.productImage}
                    onChange={(e) => setForm({ ...form, productImage: e.target.value })}
                  />
                  {fieldErrors.productImage && <div className="error-text">{fieldErrors.productImage}</div>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label"><i className="fas fa-boxes" /> Availability:</label>
                <input
                  className={`form-input ${fieldErrors.availability ? 'error' : ''}`}
                  type="number"
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  required
                />
                {fieldErrors.availability && <div className="error-text">{fieldErrors.availability}</div>}
              </div>
              <button type="submit" className="btn-primary">
                <i className="fas fa-plus-circle" /> Add Product
              </button>
            </form>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <i className="fas fa-shopping-bag" /> Products List
          </motion.h1>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, maxWidth: 720 }}>
            <input
              type="search"
              placeholder="Search items..."
              aria-label="Search items"
              value={filter.search}
              onChange={(e) => setFilter({ search: e.target.value, category: filter.category })}
              style={{
                flex: 1,
                fontSize: 16,
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid var(--card-border)',
                background: 'var(--page-bg)',
                color: 'var(--text-color)',
                minWidth: 280,
              }}
            />
            <select
              value={filter.category || ''}
              onChange={(e) => setFilter({ search: filter.search, category: e.target.value })}
              style={{ fontSize: 16, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--card-border)', background: 'var(--page-bg)', color: 'var(--text-color)' }}
            >
              <option value="">All Categories</option>
              {[...new Set(productsList.map(p => p.category).filter(Boolean))].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {productState.loading && <div className="loading">Loading products…</div>}
          {!productState.loading && productState.error && (
            <div className="empty-state"><i className="fas fa-box-open" /> {productState.error}</div>
          )}
          {!productState.loading && !productState.error && filteredProducts.length === 0 && (
            <div className="empty-state"><i className="fas fa-box-open" /> No products available.</div>
          )}

          {!productState.loading && !productState.error && filteredProducts.length > 0 && (
            <>
              <div className="products-grid">
                {filteredProducts.slice(0, visible).map((p, idx) => (
                  <motion.div
                    key={(p._id || idx) + ''}
                    className="product-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                  >
                    <div className="product-img">
                      <img src={getImgSrc(p.image_url || p.imageUrl)} alt={p.name} onError={(e)=>{ e.currentTarget.src='/images/placeholder.jpg'; e.currentTarget.alt='Image not available'; }} />
                    </div>
                    <div className="product-info">
                      <h4 style={{ fontFamily: 'Cinzel, serif', color: 'var(--sea-green)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>{p.name}</h4>
                      <h4 style={{ fontFamily: 'Cinzel, serif', color: 'var(--sea-green)', marginBottom: '0.5rem', fontSize: '1rem' }}>{p.category}</h4>
                      <p className="product-price"><i className="fas fa-rupee-sign" /> {p.price}</p>
                      <p className="product-available"><i className="fas fa-box" /> Available: {p.availability}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div style={{ textAlign: 'center', margin: '2rem 0', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                {visible < filteredProducts.length && (
                  <button className="action-btn" onClick={() => setVisible((v) => v + VISIBLE_COUNT)}>
                    <i className="fas fa-chevron-down" /> More
                  </button>
                )}
                {visible > VISIBLE_COUNT && (
                  <button className="action-btn" onClick={() => setVisible(VISIBLE_COUNT)}>
                    <i className="fas fa-chevron-up" /> Hide
                  </button>
                )}
              </div>
            </>
          )}

          <div style={{ textAlign: 'right', marginTop: '2rem' }}>
            <Link to="/coordinator/coordinator_dashboard" className="action-btn">
              <i className="fas fa-arrow-left" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreManagement;
