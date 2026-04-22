import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HiSearch, HiPlusCircle, HiMinusSm, HiExclamation, HiCheckCircle } from 'react-icons/hi';
import API_BASE from '../utils/api';

const LOW_STOCK_DEFAULT = 5;

const StockBadge = ({ stock, threshold }) => {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
        <HiExclamation className="w-3.5 h-3.5" /> Out of Stock
      </span>
    );
  if (stock <= threshold)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
        <HiExclamation className="w-3.5 h-3.5" /> Low Stock ({stock})
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
      <HiCheckCircle className="w-3.5 h-3.5" /> In Stock ({stock})
    </span>
  );
};

const StockManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [updating, setUpdating] = useState(null); // book id being updated

  // Per-book form state: { [bookId]: { addQty, threshold } }
  const [formState, setFormState] = useState({});

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${API_BASE}/books`);
        const data = await res.json();
        setBooks(data);
        // Init form state
        const init = {};
        data.forEach(b => {
          init[b._id] = { addQty: '', threshold: b.lowStockThreshold ?? LOW_STOCK_DEFAULT };
        });
        setFormState(init);
      } catch {
        toast.error('Failed to load books.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleFormChange = (bookId, field, value) => {
    setFormState(prev => ({
      ...prev,
      [bookId]: { ...prev[bookId], [field]: value },
    }));
  };

  const handleUpdateStock = async (book, mode) => {
    const token = localStorage.getItem('bookstore-token');
    const fs = formState[book._id] || {};
    const qty = parseInt(fs.addQty, 10);
    const threshold = parseInt(fs.threshold, 10);

    if (mode === 'add' && (isNaN(qty) || qty <= 0)) {
      toast.error('Please enter a valid quantity to add.');
      return;
    }
    if (isNaN(threshold) || threshold < 1) {
      toast.error('Threshold must be at least 1.');
      return;
    }

    const newStock = mode === 'add' ? book.stock + qty : mode === 'set' ? qty : Math.max(0, book.stock - qty);

    setUpdating(book._id);
    try {
      const res = await fetch(`${API_BASE}/books/${book._id}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock: newStock, lowStockThreshold: threshold }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update stock');
      }

      const updated = await res.json();

      setBooks(prev =>
        prev.map(b => (b._id === book._id ? { ...b, stock: updated.stock, lowStockThreshold: updated.lowStockThreshold } : b))
      );
      // Reset add qty
      setFormState(prev => ({ ...prev, [book._id]: { ...prev[book._id], addQty: '' } }));

      if (updated.stock === 0) {
        toast.error(`⚠️ "${book.bookTitle}" is now OUT OF STOCK!`);
      } else if (updated.stock <= updated.lowStockThreshold) {
        toast(`🟡 Low Stock: "${book.bookTitle}" has only ${updated.stock} left.`, {
          icon: '⚠️',
          style: { background: '#fff7ed', color: '#c2410c' },
        });
      } else {
        toast.success(`✅ Stock updated! "${book.bookTitle}" → ${updated.stock} units`);
      }
    } catch (err) {
      toast.error(err.message || 'Error updating stock');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = books.filter(b => {
    const matchSearch = b.bookTitle?.toLowerCase().includes(search.toLowerCase()) ||
      b.authorName?.toLowerCase().includes(search.toLowerCase());
    const threshold = formState[b._id]?.threshold ?? b.lowStockThreshold ?? LOW_STOCK_DEFAULT;
    const matchFilter =
      filter === 'All' ? true :
      filter === 'Out of Stock' ? b.stock === 0 :
      filter === 'Low Stock' ? b.stock > 0 && b.stock <= threshold :
      b.stock > threshold; // In Stock
    return matchSearch && matchFilter;
  });

  // Only platform books count in admin stats (vendor = null)
  const platformBooks = books.filter(b => !b.vendor);
  const totalStock  = platformBooks.reduce((sum, b) => sum + (b.stock ?? 0), 0);
  const lowCount    = platformBooks.filter(b => b.stock > 0 && b.stock <= (b.lowStockThreshold ?? LOW_STOCK_DEFAULT)).length;
  const outCount    = platformBooks.filter(b => b.stock === 0).length;
  const okCount     = platformBooks.filter(b => b.stock > (b.lowStockThreshold ?? LOW_STOCK_DEFAULT)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📦 Stock Management</h1>
        <p className="text-gray-500 mt-1">Add stock to books and manage low-stock thresholds.</p>
      </div>

      {/* Summary Cards — 4 columns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Total Stock</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{totalStock}</p>
          <p className="text-xs text-blue-400 mt-0.5">units across all books</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4">
          <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">In Stock</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{okCount}</p>
          <p className="text-xs text-green-400 mt-0.5">titles</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4">
          <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide">Low Stock</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{lowCount}</p>
          <p className="text-xs text-orange-400 mt-0.5">titles</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
          <p className="text-xs text-red-600 font-semibold uppercase tracking-wide">Out of Stock</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{outCount}</p>
          <p className="text-xs text-red-400 mt-0.5">titles</p>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search books or author..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="px-5 py-4">Book</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Stock Status</th>
                <th className="px-5 py-4 min-w-[120px]">Threshold</th>
                <th className="px-5 py-4 min-w-[200px]">Add Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                    No books found.
                  </td>
                </tr>
              ) : (
                filtered.map(book => {
                  const fs = formState[book._id] || { addQty: '', threshold: book.lowStockThreshold ?? LOW_STOCK_DEFAULT };
                  const isUpdating = updating === book._id;
                  const threshold = parseInt(fs.threshold, 10) || book.lowStockThreshold || LOW_STOCK_DEFAULT;

                  return (
                    <tr key={book._id} className={`hover:bg-gray-50 transition-colors ${book.stock === 0 ? 'bg-red-50/30' : book.stock <= threshold ? 'bg-orange-50/30' : ''}`}>
                      {/* Book info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={book.imageURL}
                            alt={book.bookTitle}
                            className="w-10 h-14 object-cover rounded-lg shadow-sm"
                            onError={e => { e.target.src = 'https://via.placeholder.com/40x56?text=📚'; }}
                          />
                          <div>
                            <p className="font-semibold text-gray-800 line-clamp-1 max-w-[180px]">{book.bookTitle}</p>
                            <p className="text-xs text-gray-400">{book.authorName}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium">{book.category}</span>
                      </td>

                      {/* Stock status */}
                      <td className="px-5 py-4">
                        <StockBadge stock={book.stock ?? 0} threshold={threshold} />
                      </td>

                      {/* Threshold input — locked for vendor books */}
                      <td className="px-5 py-4">
                        {book.vendor ? (
                          <span className="text-xs text-gray-400 italic">—</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="1"
                              value={fs.threshold}
                              onChange={e => handleFormChange(book._id, 'threshold', e.target.value)}
                              className="w-16 text-center border border-gray-200 rounded-lg py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <span className="text-xs text-gray-400">min</span>
                          </div>
                        )}
                      </td>

                      {/* Add stock controls — locked for vendor books */}
                      <td className="px-5 py-4">
                        {book.vendor ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-400 text-xs font-semibold rounded-lg cursor-not-allowed select-none">
                            🔒 Vendor Managed
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              placeholder="Qty"
                              value={fs.addQty}
                              onChange={e => handleFormChange(book._id, 'addQty', e.target.value)}
                              className="w-20 text-center border border-gray-200 rounded-lg py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStock(book, 'add')}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              <HiPlusCircle className="w-4 h-4" />
                              {isUpdating ? '...' : 'Add'}
                            </button>
                            {book.stock > 0 && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleUpdateStock(book, 'remove')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors"
                              >
                                <HiMinusSm className="w-4 h-4" />
                                Remove
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
