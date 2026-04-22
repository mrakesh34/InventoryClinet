import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  HiSearch, HiPlusCircle, HiMinusSm, HiExclamation,
  HiCheckCircle, HiBookOpen, HiChevronDown, HiChevronUp,
} from 'react-icons/hi';
import API_BASE from '../utils/api';

const LOW_STOCK_DEFAULT = 5;
const MAX_OP = 10000;

/* ── Stock Badge ─────────────────────────────────────────────── */
const StockBadge = ({ stock, threshold }) => {
  if (stock === 0)
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><HiExclamation className="w-3.5 h-3.5" /> Out of Stock</span>;
  if (stock <= threshold)
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700"><HiExclamation className="w-3.5 h-3.5" /> Low Stock ({stock})</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"><HiCheckCircle className="w-3.5 h-3.5" /> In Stock ({stock})</span>;
};

/* ── Main Component ──────────────────────────────────────────── */
const VendorStockManagement = () => {
  const [books, setBooks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('All');
  const [updating, setUpdating]   = useState(null);
  const [formState, setFormState] = useState({});

  /* ── Quick Add panel state ───────────────────────────────── */
  const [panelOpen, setPanelOpen]         = useState(false);
  const [bookSearch, setBookSearch]       = useState('');
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [selectedBook, setSelectedBook]   = useState(null);
  const [addQtyVal, setAddQtyVal]         = useState('');
  const [addThreshold, setAddThreshold]   = useState('');
  const [saving, setSaving]               = useState(false);
  const dropdownRef = useRef(null);

  /* ── Fetch books ─────────────────────────────────────────── */
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem('bookstore-token');
        const res = await fetch(`${API_BASE}/books/my-books`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        const booksArr = Array.isArray(data) ? data : [];
        setBooks(booksArr);
        const init = {};
        booksArr.forEach(b => { init[b._id] = { addQty: '', threshold: b.lowStockThreshold ?? LOW_STOCK_DEFAULT }; });
        setFormState(init);
      } catch { toast.error('Failed to load your books.'); }
      finally { setLoading(false); }
    };
    fetchBooks();
  }, []);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Sync selectedBook after books update ─────────────────── */
  useEffect(() => {
    if (selectedBook) {
      const updated = books.find(b => b._id === selectedBook._id);
      if (updated) setSelectedBook(updated);
    }
  }, [books]);

  /* ── Table inline form handlers ───────────────────────────── */
  const handleFormChange = (bookId, field, value) =>
    setFormState(prev => ({ ...prev, [bookId]: { ...prev[bookId], [field]: value } }));

  const handleUpdateStock = async (book, mode) => {
    const token = localStorage.getItem('bookstore-token');
    const fs = formState[book._id] || {};
    const qty = parseInt(fs.addQty, 10);
    const threshold = parseInt(fs.threshold, 10);
    if (mode === 'add' && (isNaN(qty) || qty <= 0)) { toast.error('Enter a valid quantity.'); return; }
    if (!isNaN(qty) && qty > MAX_OP) { toast.error(`Cannot add or remove more than ${MAX_OP.toLocaleString()} units in a single operation.`); return; }
    if (isNaN(threshold) || threshold < 1) { toast.error('Threshold must be at least 1.'); return; }
    const newStock = mode === 'add' ? book.stock + qty : Math.max(0, book.stock - qty);
    setUpdating(book._id);
    try {
      const res = await fetch(`${API_BASE}/books/${book._id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stock: newStock, lowStockThreshold: threshold }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to update stock'); }
      const updated = await res.json();
      setBooks(prev => prev.map(b => b._id === book._id ? { ...b, stock: updated.stock, lowStockThreshold: updated.lowStockThreshold } : b));
      setFormState(prev => ({ ...prev, [book._id]: { ...prev[book._id], addQty: '' } }));
      if (updated.stock === 0) toast.error(`⚠️ "${book.bookTitle}" is now OUT OF STOCK!`);
      else if (updated.stock <= updated.lowStockThreshold) toast(`🟡 Low Stock: "${book.bookTitle}" → ${updated.stock} left`, { icon: '⚠️' });
      else toast.success(`✅ Stock updated! "${book.bookTitle}" → ${updated.stock} units`);
    } catch (err) { toast.error(err.message || 'Error updating stock'); }
    finally { setUpdating(null); }
  };

  /* ── Quick Add panel handlers ─────────────────────────────── */
  const selectBook = (book) => {
    setSelectedBook(book);
    setAddThreshold(String(book.lowStockThreshold ?? LOW_STOCK_DEFAULT));
    setAddQtyVal('');
    setDropdownOpen(false);
    setBookSearch('');
  };

  const handleQuickAdd = async () => {
    if (!selectedBook) { toast.error('Please select a book first.'); return; }
    const qty = parseInt(addQtyVal, 10);
    const thr = parseInt(addThreshold, 10);
    if (isNaN(qty) || qty < 1) { toast.error('Enter a valid quantity (min 1).'); return; }
    if (qty > MAX_OP) { toast.error(`Cannot add more than ${MAX_OP.toLocaleString()} units in a single operation.`); return; }
    if (isNaN(thr) || thr < 1) { toast.error('Threshold must be at least 1.'); return; }
    const token = localStorage.getItem('bookstore-token');
    const newStock = (selectedBook.stock ?? 0) + qty;
    setSaving(true);
    const tid = toast.loading(`Adding ${qty} unit(s) to "${selectedBook.bookTitle}"...`);
    try {
      const res = await fetch(`${API_BASE}/books/${selectedBook._id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stock: newStock, lowStockThreshold: thr }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      const updated = await res.json();
      setBooks(prev => prev.map(b => b._id === updated._id ? { ...b, stock: updated.stock, lowStockThreshold: updated.lowStockThreshold } : b));
      setAddQtyVal('');
      if (updated.stock === 0) toast.error(`"${updated.bookTitle}" is OUT OF STOCK!`, { id: tid });
      else if (updated.stock <= updated.lowStockThreshold) toast(`⚠️ Low Stock: "${updated.bookTitle}" — only ${updated.stock} left`, { id: tid });
      else toast.success(`✅ +${qty} added! "${updated.bookTitle}" now has ${updated.stock} units`, { id: tid });
    } catch (err) { toast.error(err.message, { id: tid }); }
    finally { setSaving(false); }
  };

  /* ── Derived values ───────────────────────────────────────── */
  const filteredBooks = books.filter(b => {
    const matchSearch = b.bookTitle?.toLowerCase().includes(search.toLowerCase()) || b.authorName?.toLowerCase().includes(search.toLowerCase());
    const threshold = formState[b._id]?.threshold ?? b.lowStockThreshold ?? LOW_STOCK_DEFAULT;
    const matchFilter = filter === 'All' ? true : filter === 'Out of Stock' ? b.stock === 0 : filter === 'Low Stock' ? b.stock > 0 && b.stock <= threshold : b.stock > threshold;
    return matchSearch && matchFilter;
  });

  const filteredDropdown = books.filter(b =>
    b.bookTitle?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.authorName?.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const totalStock = books.reduce((sum, b) => sum + (b.stock ?? 0), 0);
  const lowCount   = books.filter(b => b.stock > 0 && b.stock <= (b.lowStockThreshold ?? LOW_STOCK_DEFAULT)).length;
  const outCount   = books.filter(b => b.stock === 0).length;
  const okCount    = books.filter(b => b.stock > (b.lowStockThreshold ?? LOW_STOCK_DEFAULT)).length;

  const stockStatusLabel = (book) => {
    const s = book.stock ?? 0, t = book.lowStockThreshold ?? LOW_STOCK_DEFAULT;
    if (s === 0) return { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' };
    if (s <= t)  return { label: `Low (${s})`,   cls: 'bg-orange-100 text-orange-700' };
    return           { label: `In Stock (${s})`, cls: 'bg-green-100 text-green-700' };
  };

  if (loading) return <div className="flex items-center justify-center h-64 w-full"><div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" /></div>;

  return (
    <div className="w-full px-6 py-8 max-w-6xl">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📦 My Stock Management</h1>
          <p className="text-gray-500 mt-1">Manage and update stock for all your books in one place.</p>
        </div>
        <button
          onClick={() => { setPanelOpen(o => !o); setSelectedBook(null); setAddQtyVal(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${panelOpen ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
        >
          <HiPlusCircle className="w-5 h-5" />
          {panelOpen ? 'Hide Quick Add' : 'Quick Add Stocks'}
          {panelOpen ? <HiChevronUp className="w-4 h-4" /> : <HiChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4"><p className="text-xs text-amber-600 font-semibold uppercase">Total Stock</p><p className="text-3xl font-bold text-amber-700 mt-1">{totalStock}</p></div>
        <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4"><p className="text-xs text-green-600 font-semibold uppercase">In Stock</p><p className="text-3xl font-bold text-green-700 mt-1">{okCount}</p></div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4"><p className="text-xs text-orange-600 font-semibold uppercase">Low Stock</p><p className="text-3xl font-bold text-orange-600 mt-1">{lowCount}</p></div>
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4"><p className="text-xs text-red-600 font-semibold uppercase">Out of Stock</p><p className="text-3xl font-bold text-red-600 mt-1">{outCount}</p></div>
      </div>

      {/* ── Quick Add Stock Panel ───────────────────────────── */}
      {panelOpen && (
        <div className="mb-6 bg-white border border-amber-200 rounded-2xl shadow-sm">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100 rounded-t-2xl">
            <h2 className="font-bold text-gray-800 text-base">➕ Quick Add Stock</h2>
            <p className="text-xs text-gray-500 mt-0.5">Select a book, set quantity and threshold, then click Add Stock.</p>
          </div>
          <div className="p-6 space-y-5">

            {/* Book selector */}
            <div ref={dropdownRef} className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Book <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setDropdownOpen(o => !o)}
                className="w-full flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors text-left"
              >
                {selectedBook ? (
                  <span className="flex items-center gap-3">
                    <img src={selectedBook.imageURL} alt="" className="w-8 h-11 object-cover rounded-md shadow-sm" onError={e => { e.target.src = 'https://via.placeholder.com/32x44?text=📚'; }} />
                    <span>
                      <span className="font-semibold text-gray-800 block">{selectedBook.bookTitle}</span>
                      <span className="text-xs text-gray-400">{selectedBook.authorName} · {selectedBook.category}</span>
                    </span>
                  </span>
                ) : (
                  <span className="text-gray-400 flex items-center gap-2"><HiBookOpen className="w-5 h-5" /> Choose one of your books...</span>
                )}
                <HiChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute z-30 top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input autoFocus type="text" placeholder="Search books..." value={bookSearch}
                        onChange={e => setBookSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredDropdown.length === 0 ? (
                      <div className="px-4 py-6 text-center text-gray-400 text-sm">No books found.</div>
                    ) : filteredDropdown.map(book => {
                      const sl = stockStatusLabel(book);
                      return (
                        <button key={book._id} type="button" onClick={() => selectBook(book)}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-amber-50 transition-colors text-left border-b border-gray-50 last:border-0 ${selectedBook?._id === book._id ? 'bg-amber-50' : ''}`}>
                          <span className="flex items-center gap-3">
                            <img src={book.imageURL} alt="" className="w-8 h-11 object-cover rounded-md shadow-sm" onError={e => { e.target.src = 'https://via.placeholder.com/32x44?text=📚'; }} />
                            <span>
                              <span className="font-medium text-gray-800 block text-sm">{book.bookTitle}</span>
                              <span className="text-xs text-gray-400">{book.authorName} · {book.category}</span>
                            </span>
                          </span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${sl.cls}`}>{sl.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Book preview card */}
            {selectedBook && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <img src={selectedBook.imageURL} alt={selectedBook.bookTitle}
                    className="w-20 h-28 object-cover rounded-xl shadow-md flex-shrink-0"
                    onError={e => { e.target.src = 'https://via.placeholder.com/80x112?text=📚'; }} />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{selectedBook.bookTitle}</h3>
                    <p className="text-sm text-gray-500 mb-3">{selectedBook.authorName} · {selectedBook.category}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                        <p className="text-2xl font-bold text-gray-800">{selectedBook.stock ?? 0}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Current Stock</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                        <p className="text-2xl font-bold text-orange-500">{selectedBook.lowStockThreshold ?? LOW_STOCK_DEFAULT}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Low Threshold</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                        {selectedBook.stock === 0
                          ? <p className="text-sm font-bold text-red-600 flex items-center justify-center gap-1 mt-1"><HiExclamation className="w-4 h-4" />Out</p>
                          : selectedBook.stock <= (selectedBook.lowStockThreshold ?? LOW_STOCK_DEFAULT)
                          ? <p className="text-sm font-bold text-orange-500 flex items-center justify-center gap-1 mt-1"><HiExclamation className="w-4 h-4" />Low</p>
                          : <p className="text-sm font-bold text-green-600 flex items-center justify-center gap-1 mt-1"><HiCheckCircle className="w-4 h-4" />OK</p>}
                        <p className="text-xs text-gray-500 mt-0.5">Status</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Qty + Threshold + Submit */}
            {selectedBook && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Quantity to Add <span className="text-red-500">*</span></label>
                  <input type="number" min="1" max="10000" placeholder="e.g. 50" value={addQtyVal}
                    onChange={e => setAddQtyVal(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  {addQtyVal && !isNaN(parseInt(addQtyVal, 10)) && (() => {
                    const n = parseInt(addQtyVal, 10);
                    const over = n > MAX_OP;
                    return <p className={`text-xs mt-1.5 font-medium ${over ? 'text-red-500' : 'text-amber-600'}`}>
                      {over ? `⚠️ Max ${MAX_OP.toLocaleString()} units per operation` : `New total: ${(selectedBook.stock ?? 0) + n} units`}
                    </p>;
                  })()}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Low Stock Threshold</label>
                  <input type="number" min="1" placeholder="e.g. 5" value={addThreshold}
                    onChange={e => setAddThreshold(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  <p className="text-xs text-gray-400 mt-1.5">Alert when stock falls at or below this number</p>
                </div>
              </div>
            )}
            {selectedBook && (
              <button disabled={saving || !addQtyVal} onClick={handleQuickAdd}
                className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-colors">
                <HiPlusCircle className="w-5 h-5" />
                {saving ? 'Adding Stock...' : 'Add Stock'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Search + Filter ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search your books..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${filter === f ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* ── Books Table ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="px-5 py-4">Book</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Stock Status</th>
                <th className="px-5 py-4 min-w-[120px]">Threshold</th>
                <th className="px-5 py-4 min-w-[220px]">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBooks.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">No books found.</td></tr>
              ) : filteredBooks.map(book => {
                const fs = formState[book._id] || { addQty: '', threshold: book.lowStockThreshold ?? LOW_STOCK_DEFAULT };
                const isUpdating = updating === book._id;
                const threshold = parseInt(fs.threshold, 10) || book.lowStockThreshold || LOW_STOCK_DEFAULT;
                return (
                  <tr key={book._id} className={`hover:bg-gray-50 transition-colors ${book.stock === 0 ? 'bg-red-50/30' : book.stock <= threshold ? 'bg-orange-50/30' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={book.imageURL} alt={book.bookTitle} className="w-10 h-14 object-cover rounded-lg shadow-sm" onError={e => { e.target.src = 'https://via.placeholder.com/40x56?text=📚'; }} />
                        <div>
                          <p className="font-semibold text-gray-800 line-clamp-1 max-w-[180px]">{book.bookTitle}</p>
                          <p className="text-xs text-gray-400">{book.authorName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-lg font-medium">{book.category}</span></td>
                    <td className="px-5 py-4"><StockBadge stock={book.stock ?? 0} threshold={threshold} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <input type="number" min="1" value={fs.threshold}
                          onChange={e => handleFormChange(book._id, 'threshold', e.target.value)}
                          className="w-16 text-center border border-gray-200 rounded-lg py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                        <span className="text-xs text-gray-400">min</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <input type="number" min="1" max="10000" placeholder="Qty" value={fs.addQty}
                            onChange={e => handleFormChange(book._id, 'addQty', e.target.value)}
                            className="w-20 text-center border border-gray-200 rounded-lg py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                          <button disabled={isUpdating} onClick={() => handleUpdateStock(book, 'add')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors">
                            <HiPlusCircle className="w-4 h-4" />{isUpdating ? '...' : 'Add'}
                          </button>
                          {book.stock > 0 && (
                            <button disabled={isUpdating} onClick={() => handleUpdateStock(book, 'remove')}
                              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors">
                              <HiMinusSm className="w-4 h-4" />Remove
                            </button>
                          )}
                        </div>
                        {/* Live preview */}
                        {fs.addQty && !isNaN(parseInt(fs.addQty, 10)) && (() => {
                          const n = parseInt(fs.addQty, 10);
                          return <p className={`text-[10px] font-medium ${n > MAX_OP ? 'text-red-500' : 'text-amber-600'}`}>
                            {n > MAX_OP ? `⚠️ Max ${MAX_OP.toLocaleString()} per op` : `After add: ${(book.stock ?? 0) + n} · After remove: ${Math.max(0, (book.stock ?? 0) - n)}`}
                          </p>;
                        })()}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorStockManagement;
