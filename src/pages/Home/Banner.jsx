import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import BannerCard from '../shared/BannerCard'
import API_BASE from '../../utils/api'

export const Banner = () => {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();
    const wrapperRef = useRef(null);

    // Fetch all books once for suggestions
    useEffect(() => {
        fetch(`${API_BASE}/books`)
            .then(r => r.json())
            .then(data => setBooks(data))
            .catch(() => {});
    }, []);

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Filter suggestions as user types
    useEffect(() => {
        if (query.trim().length < 2) {
            setSuggestions([]);
            return;
        }
        const q = query.toLowerCase();
        const matched = books
            .filter(b => b.bookTitle.toLowerCase().includes(q) || (b.authorName && b.authorName.toLowerCase().includes(q)))
            .slice(0, 5);
        setSuggestions(matched);
    }, [query, books]);

    const handleSearch = () => {
        if (query.trim()) {
            navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
        } else {
            navigate('/shop');
        }
        setShowSuggestions(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleSuggestionClick = (title) => {
        setQuery(title);
        setShowSuggestions(false);
        navigate(`/shop?search=${encodeURIComponent(title)}`);
    };

    return (
        <div className='bg-teal-100 px-4 lg:px-24 flex items-center'>
            <div className='flex flex-col md:flex-row-reverse justify-between items-center gap-12 py-40'>
                {/* right side */}
                <div className='md:w-1/2 h-full'>
                    <BannerCard />
                </div>

                {/* left side */}
                <div className='md:w-1/2 space-y-8 bg-teal-100'>
                    <h1 className='lg:text-6xl text-5xl font-bold text-black mb-5 lg:leading-tight leading-snug'>Buy and sell your books <span className='text-blue-700'>for the best prices</span></h1>
                    <p>Discover books across multiple categories — from programming and tech to fiction and self-help. Shop with confidence using secure payments and real-time stock availability.</p>
                    
                    {/* Search with suggestions */}
                    <div className='relative' ref={wrapperRef}>
                        <div className='flex'>
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                placeholder='Search a book here'
                                className='py-2 px-3 rounded-l-md flex-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                            <button
                                onClick={handleSearch}
                                className='bg-blue-700 px-6 py-2 text-white font-medium hover:bg-black transition-all ease-in duration-200 rounded-r-md'
                            >
                                Search
                            </button>
                        </div>

                        {/* Suggestions dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden'>
                                {suggestions.map(book => (
                                    <button
                                        key={book._id}
                                        onClick={() => handleSuggestionClick(book.bookTitle)}
                                        className='w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-b-0'
                                    >
                                        <img
                                            src={book.imageURL}
                                            alt=""
                                            className='w-8 h-10 object-cover rounded flex-shrink-0'
                                        />
                                        <div className='min-w-0'>
                                            <p className='text-sm font-medium text-gray-800 truncate'>{book.bookTitle}</p>
                                            <p className='text-xs text-gray-400 truncate'>{book.authorName}</p>
                                        </div>
                                        <span className='ml-auto text-xs font-bold text-blue-600 flex-shrink-0'>
                                            ₹{book.price?.toFixed(2)}
                                        </span>
                                    </button>
                                ))}
                                <button
                                    onClick={handleSearch}
                                    className='w-full text-center px-4 py-2 text-sm text-blue-600 font-semibold hover:bg-blue-50 transition-colors'
                                >
                                    See all results for "{query}" →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Banner;
