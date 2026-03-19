import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HiSearch, HiPlusCircle, HiBookOpen, HiCheckCircle, HiExclamation } from 'react-icons/hi';
import API_BASE from '../utils/api';

const AddBookStock = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [qty, setQty] = useState('');
  const [threshold, setThreshold] = useState('');
  const [saving, setSaving] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/books`)
      .then(r => r.json())
      .then(data => { setBooks(data); setLoading(false); })
      .catch(() => { toast.error('Failed to load books.'); setLoading(false); });
  }, []);

  const filtered = books.filter(b =>
    b.bookTitle?.toLowerCase().includes(search.toLowerCase()) ||
    b.authorName?.toLowerCase().includes(search.toLowerCase())
  );

  const selectBook = (book) => {
    setSelectedBook(book);
    setThreshold(String(book.lowStockThreshold ?? 5));
    setQty('');
    setDropdownOpen(false);
    setSearch('');
  };

  const handleAdd = async () => {
    if (!selectedBook) { toast.error('Please select a book first.'); return; }
    const addQty = parseInt(qty, 10);
    const thr = parseInt(threshold, 10);
    if (isNaN(addQty) || addQty < 1) { toast.error('Enter a valid quantity (min 1).'); return; }
    if (isNaN(thr) || thr < 1)       { toast.error('Threshold must be at least 1.'); return; }

    const token = localStorage.getItem('bookstore-token');
    const newStock = (selectedBook.stock ?? 0) + addQty;
    setSaving(true);
    const tid = toast.loading(`Adding ${addQty} unit(s) to "${selectedBook.bookTitle}"...`);
    try {
      const res = await fetch(`${API_BASE}/books/${selectedBook._id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stock: newStock, lowStockThreshold: thr }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      const updated = await res.json();

      // Update local books list
      setBooks(prev => prev.map(b => b._id === updated._id ? { ...b, stock: updated.stock, lowStockThreshold: updated.lowStockThreshold } : b));
      setSelectedBook(prev => ({ ...prev, stock: updated.stock, lowStockThreshold: updated.lowStockThreshold }));
      setQty('');

      if (updated.stock === 0)
        toast.error(`"${updated.bookTitle}" is OUT OF STOCK!`, { id: tid });
      else if (updated.stock <= updated.lowStockThreshold)
        toast(`⚠️ Low Stock: "${updated.bookTitle}" — only ${updated.stock} left`, { id: tid, style: { background: '#fff7ed', color: '#c2410c' } });
      else
        toast.success(`✅ +${addQty} added! "${updated.bookTitle}" now has ${updated.stock} units`, { id: tid });
    } catch (err) {
      toast.error(err.message, { id: tid });
    } finally {
      setSaving(false);
    }
  };

  const stockLabel = (book) => {
    const s = book.stock ?? 0;
    const t = book.lowStockThreshold ?? 5;
    if (s === 0)  return { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' };
    if (s <= t)   return { label: `Low (${s})`, cls: 'bg-orange-100 text-orange-700' };
    return          { label: `In Stock (${s})`, cls: 'bg-green-100 text-green-700' };
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="w-full px-6 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">➕ Add Book Stock</h1>
        <p className="text-gray-500 mt-1">Select a book from the dropdown and add inventory stock.</p>
      </div>

      {/* Book Selector Dropdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select Book <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          {/* Trigger button */}
          <button
            type="button"
            onClick={() => setDropdownOpen(o => !o)}
            className="w-full flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-left"
          >
            {selectedBook ? (
              <span className="flex items-center gap-3">
                <img src={selectedBook.imageURL} alt="" className="w-8 h-11 object-cover rounded-md shadow-sm"
                  onError={e => { e.target.src = 'https://via.placeholder.com/32x44?text=📚'; }} />
                <span>
                  <span className="font-semibold text-gray-800 block">{selectedBook.bookTitle}</span>
                  <span className="text-xs text-gray-400">{selectedBook.authorName}</span>
                </span>
              </span>
            ) : (
              <span className="text-gray-400 flex items-center gap-2">
                <HiBookOpen className="w-5 h-5" /> Choose a book...
              </span>
            )}
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute z-20 top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
              {/* Search inside dropdown */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search books..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* Book list */}
              <div className="max-h-64 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-400 text-sm">No books found.</div>
                ) : (
                  filtered.map(book => {
                    const sl = stockLabel(book);
                    return (
                      <button
                        key={book._id}
                        type="button"
                        onClick={() => selectBook(book)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0 ${selectedBook?._id === book._id ? 'bg-blue-50' : ''}`}
                      >
                        <span className="flex items-center gap-3">
                          <img src={book.imageURL} alt="" className="w-8 h-11 object-cover rounded-md shadow-sm"
                            onError={e => { e.target.src = 'https://via.placeholder.com/32x44?text=📚'; }} />
                          <span>
                            <span className="font-medium text-gray-800 block text-sm">{book.bookTitle}</span>
                            <span className="text-xs text-gray-400">{book.authorName} · {book.category}</span>
                          </span>
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${sl.cls}`}>{sl.label}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Book Info Card */}
      {selectedBook && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <img src={selectedBook.imageURL} alt={selectedBook.bookTitle}
              className="w-20 h-28 object-cover rounded-xl shadow-md"
              onError={e => { e.target.src = 'https://via.placeholder.com/80x112?text=📚'; }} />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800">{selectedBook.bookTitle}</h3>
              <p className="text-sm text-gray-500 mb-3">{selectedBook.authorName} · {selectedBook.category}</p>

              {/* Stock stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-2xl font-bold text-gray-800">{selectedBook.stock ?? 0}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Current Stock</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-2xl font-bold text-orange-500">{selectedBook.lowStockThreshold ?? 5}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Low Threshold</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  {selectedBook.stock === 0 ? (
                    <p className="text-sm font-bold text-red-600 flex items-center justify-center gap-1 mt-1"><HiExclamation className="w-4 h-4" />Out</p>
                  ) : selectedBook.stock <= (selectedBook.lowStockThreshold ?? 5) ? (
                    <p className="text-sm font-bold text-orange-500 flex items-center justify-center gap-1 mt-1"><HiExclamation className="w-4 h-4" />Low</p>
                  ) : (
                    <p className="text-sm font-bold text-green-600 flex items-center justify-center gap-1 mt-1"><HiCheckCircle className="w-4 h-4" />OK</p>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5">Status</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Form */}
      {selectedBook && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Add Stock</h3>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Quantity to Add <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 50"
                value={qty}
                onChange={e => setQty(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {qty && !isNaN(parseInt(qty, 10)) && (
                <p className="text-xs text-blue-600 mt-1.5 font-medium">
                  New total: {(selectedBook.stock ?? 0) + parseInt(qty, 10)} units
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Low Stock Threshold
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 5"
                value={threshold}
                onChange={e => setThreshold(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1.5">Alert when stock falls at or below this number</p>
            </div>
          </div>

          <button
            disabled={saving || !qty}
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <HiPlusCircle className="w-5 h-5" />
            {saving ? 'Adding Stock...' : 'Add Stock'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddBookStock;
