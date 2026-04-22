import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Spinner } from 'flowbite-react';
import { AuthContext } from '../../contexts/AuthProvider';
import { CartContext } from '../../contexts/CartProvider';
import API_BASE from '../../utils/api';

const BOOKS_PER_PAGE = 12;

const FILTER_CATEGORIES = [
  { id: 'all', label: '🌐 All' },
  { id: 'python', label: '🐍 Python', match: (t) => t.includes('python') },
  { id: 'javascript', label: '🟨 JavaScript', match: (t) => t.includes('javascript') || t.includes('typescript') },
  { id: 'java', label: '☕ Java', match: (t) => t.includes('java') },
  { id: 'cpp', label: '⚙️ C / C++', match: (t) => t.includes('cpp') || t.includes('c') },
  { id: 'ai-ml', label: '🤖 AI & ML', match: (t) => t.includes('ai-ml') },
  { id: 'web-dev', label: '🌍 Web Dev', match: (t) => t.includes('web-dev') },
  { id: 'devops', label: '🐳 DevOps', match: (t) => t.includes('devops') },
  { id: 'algorithms', label: '📊 Algorithms', match: (t) => t.includes('algorithms') },
  { id: 'rust-go', label: '🦀 Rust / Go', match: (t) => t.includes('rust') || t.includes('go') },
];

export default function Shop() {
  const { loading, currentUser } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeFilter, setActiveFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const filterRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/books`).then(r => r.json()).then(setBooks);
  }, [loading]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeFilterDef = FILTER_CATEGORIES.find(f => f.id === activeFilter);

  const filteredBooks = books
    .filter(book => {
      const tags = book.tags || [];
      const matchesFilter = activeFilter === 'all' || activeFilterDef?.match?.(tags);
      const matchesSearch = book.bookTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      const aOut = (a.stock ?? 0) === 0;
      const bOut = (b.stock ?? 0) === 0;
      // Out-of-stock always last
      if (aOut !== bOut) return aOut ? 1 : -1;
      // Within same group: newest first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // Hide out-of-stock when user is NOT searching
  const isSearching = searchQuery.trim().length > 0;
  const visibleBooks = isSearching
    ? filteredBooks
    : filteredBooks.filter(b => (b.stock ?? 0) > 0);

  const totalPages = Math.ceil(visibleBooks.length / BOOKS_PER_PAGE);
  const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
  const pagedBooks = visibleBooks.slice(startIndex, startIndex + BOOKS_PER_PAGE);

  const resetPage = () => setCurrentPage(1);
  const handleSearchChange = (e) => { setSearchQuery(e.target.value); resetPage(); };
  const handleClearSearch = () => { setSearchQuery(''); resetPage(); };
  const handleFilter = (id) => { setActiveFilter(id); resetPage(); setFilterOpen(false); };

  const handleCartClick = (book) => {
    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: '/shop' } } });
      return;
    }
    addToCart(book);
  };

  const goToPage = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  if (loading) return <div className="text-center mt-28"><Spinner /></div>;

  return (
    <div className='my-28 px-4 lg:px-24'>
      <h2 className='text-3xl font-bold text-center mb-8 text-blue-700'>All Books are Available Here</h2>

      {/* ── Search + Filter bar ────────────────────────────── */}
      <div className='flex items-center justify-center gap-3 mb-4 flex-wrap'>
        {/* Search input */}
        <div className='relative w-full max-w-lg'>
          <span className='absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400'>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </span>
          <input
            id="shop-search-input"
            type="search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by book title…"
            className='w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800'
          />
          {searchQuery && (
            <button onClick={handleClearSearch} className='absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600'>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Filter dropdown button ─────────────────────── */}
        <div className='relative flex-shrink-0' ref={filterRef}>
          <button
            id="shop-filter-btn"
            onClick={() => setFilterOpen(o => !o)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm transition-all duration-200 ${activeFilter !== 'all'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M10 12h4" />
            </svg>
            {activeFilter === 'all' ? 'Category' : activeFilterDef?.label}
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {filterOpen && (
            <div className='absolute right-0 top-[calc(100%+8px)] z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl min-w-52 py-2 overflow-hidden animate-fade-scale'>
              {FILTER_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleFilter(cat.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors duration-150 flex items-center gap-2 ${activeFilter === cat.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {activeFilter === cat.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
                  )}
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Result summary */}
      <p className='text-center text-sm text-gray-500 mb-8'>
        {visibleBooks.length === 0
          ? `No books found`
          : `Showing ${startIndex + 1}–${Math.min(startIndex + BOOKS_PER_PAGE, visibleBooks.length)} of ${visibleBooks.length} book${visibleBooks.length !== 1 ? 's' : ''}`
        }
      </p>

      {/* ── Books Grid ──────────────────────────────────── */}
      {pagedBooks.length > 0 ? (
        <>
          <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8'>
            {pagedBooks.map(book => {
              const isOutOfStock = (book.stock ?? 0) === 0;
              return (
              <Card key={book._id} className={`overflow-hidden hover:shadow-xl transition-shadow duration-300 ${isOutOfStock ? 'opacity-55 grayscale-[30%]' : ''}`}>
                {/* Out of stock banner */}
                {isOutOfStock && (
                  <div className="-mx-4 -mt-4 mb-3 bg-red-50 border-b border-red-200 text-center py-1.5">
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest">⚠ Out of Stock</span>
                  </div>
                )}
                {/* Clickable image + title area */}
                <Link to={`/book/${book._id}`} className='block group'>
                  <div className='h-72 flex items-center justify-center bg-gray-50 rounded-t-xl overflow-hidden'>
                    <img
                      src={book.imageURL}
                      alt={book.bookTitle}
                      className='h-full object-contain group-hover:scale-105 transition-transform duration-300 p-3'
                    />
                  </div>
                  <h5 className="mt-3 text-lg font-bold tracking-tight text-gray-900 dark:text-white line-clamp-2 hover:text-blue-700 transition-colors">
                    {book.bookTitle}
                  </h5>
                  <p className='text-sm text-gray-500 line-clamp-1'>{book.authorName}</p>
                </Link>

                {/* Tags */}
                {book.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {book.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-full border border-blue-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price + stock + cart */}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xl font-bold text-blue-700">
                    ₹{book.price ? book.price.toFixed(2) : '10.00'}
                  </span>
                  {isOutOfStock ? (
                    <span className="text-xs font-bold px-2 py-1 rounded text-red-700 bg-red-100">Out of Stock</span>
                  ) : book.stock <= (book.lowStockThreshold ?? 5) ? (
                    <span className="text-xs font-bold px-2 py-1 rounded text-orange-700 bg-orange-100">Only {book.stock} left</span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-1 rounded text-green-700 bg-green-100">In Stock</span>
                  )}
                </div>

                <button
                  onClick={() => handleCartClick(book)}
                  disabled={isOutOfStock}
                  className={`w-full mt-2 px-4 py-2 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                    }`}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </Card>
              );
            })}
          </div>

          {/* ── Pagination ───────────────────────────────── */}
          {totalPages > 1 && (
            <div className='flex items-center justify-center gap-2 mt-14 flex-wrap'>
              <button
                id="shop-prev-page"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className='px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-sm'
              >
                ← Prev
              </button>
              {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                  <span key={`e${idx}`} className='px-2 text-gray-400'>…</span>
                ) : (
                  <button
                    key={page}
                    id={`shop-page-${page}`}
                    onClick={() => goToPage(page)}
                    className={`w-10 h-10 rounded-lg border font-semibold text-sm transition-all ${currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                      : 'border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-400'
                      }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                id="shop-next-page"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-sm'
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className='text-center py-20'>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className='text-xl font-semibold text-gray-500'>No books found</h3>
          <p className='text-gray-400 mt-2'>
            Try a different filter or{' '}
            <button onClick={() => { handleClearSearch(); handleFilter('all'); }} className='text-blue-600 hover:underline'>
              show all books
            </button>.
          </p>
        </div>
      )}
    </div>
  );
}
