import { Table } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import { Pagination } from 'flowbite-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiDownload } from 'react-icons/hi';
import { exportToCSV } from '../utils/csvExport';
import API_BASE from '../utils/api';

const VendorManageBooks = () => {
    const [allBooks, setAllBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [waitlistMap, setWaitlistMap] = useState({});
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const token = localStorage.getItem('bookstore-token');
        fetch(`${API_BASE}/books/my-books`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setAllBooks(Array.isArray(data) ? data : []))
            .catch(() => toast.error('Failed to load your books.'));

        // Fetch waitlist summary
        fetch(`${API_BASE}/waitlist/summary`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                const map = {};
                data.forEach(item => { map[item._id] = item.count; });
                setWaitlistMap(map);
            })
            .catch(() => {});
    }, []);

    const handleDelete = (id, title) => {
        const token = localStorage.getItem('bookstore-token');
        const toastId = toast.loading(`Deleting "${title}"...`);
        fetch(`${API_BASE}/books/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(() => {
                setAllBooks(prev => prev.filter(b => b._id !== id));
                toast.success(`"${title}" deleted successfully.`, { id: toastId });
            })
            .catch(() => toast.error('Failed to delete book.', { id: toastId }));
    };

    const totalPages = Math.max(1, Math.ceil(allBooks.length / ITEMS_PER_PAGE));
    const paginated = allBooks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const LOW_STOCK = (book) => book.stock !== undefined && book.stock <= (book.lowStockThreshold ?? 5);
    const OUT_OF_STOCK = (book) => book.stock !== undefined && book.stock === 0;

    const handleExportCSV = () => {
        exportToCSV(
            allBooks,
            'my_inventory',
            [
                { key: 'bookTitle',         label: 'Book Title' },
                { key: 'authorName',        label: 'Author' },
                { key: 'category',          label: 'Category' },
                { key: 'price',             label: 'Selling Price' },
                { key: 'costPrice',         label: 'Cost Price' },
                { key: 'stock',             label: 'Stock' },
                { key: 'lowStockThreshold', label: 'Min Threshold' },
            ]
        );
    };

    return (
        <div className='px-4 my-12 w-full max-w-6xl'>
            <div className="flex items-center justify-between mb-8">
                <h2 className='text-3xl font-bold'>🏪 My Books</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        disabled={allBooks.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
                    >
                        <HiDownload className="w-4 h-4" /> Export CSV
                    </button>
                    <Link
                        to="/vendor/dashboard/upload"
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-colors"
                    >
                        + Upload New Book
                    </Link>
                </div>
            </div>

            {allBooks.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-5xl mb-4">📚</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No books yet</h3>
                    <p className="text-gray-400 mb-6">Start selling by uploading your first book.</p>
                    <Link to="/vendor/dashboard/upload" className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors">
                        Upload Book
                    </Link>
                </div>
            ) : (
                <>
                    <Table className='w-full'>
                        <Table.Head>
                            <Table.HeadCell>No.</Table.HeadCell>
                            <Table.HeadCell>Book Name</Table.HeadCell>
                            <Table.HeadCell>Author</Table.HeadCell>
                            <Table.HeadCell>Category</Table.HeadCell>
                            <Table.HeadCell>Price</Table.HeadCell>
                            <Table.HeadCell>Stock</Table.HeadCell>
                            <Table.HeadCell>Actions</Table.HeadCell>
                        </Table.Head>

                        {paginated.map((book, index) => (
                            <Table.Body className="divide-y" key={book._id}>
                                <Table.Row className={`bg-white dark:border-gray-700 dark:bg-gray-800 ${
                                    OUT_OF_STOCK(book) ? 'bg-red-50' : LOW_STOCK(book) ? 'bg-orange-50' : ''
                                }`}>
                                    <Table.Cell className="font-medium text-gray-900">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                    </Table.Cell>
                                    <Table.Cell className="font-medium text-gray-900 max-w-[180px] truncate">
                                        {book.bookTitle}
                                    </Table.Cell>
                                    <Table.Cell>{book.authorName}</Table.Cell>
                                    <Table.Cell>
                                        <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-lg font-medium">
                                            {book.category}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell>₹{book.price?.toFixed(2) ?? '—'}</Table.Cell>
                                    <Table.Cell>
                                        {OUT_OF_STOCK(book) ? (
                                            <div className="flex flex-col gap-1">
                                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">Out of Stock</span>
                                                {waitlistMap[book._id] > 0 && (
                                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded-full font-bold">
                                                        🕐 {waitlistMap[book._id]} waiting
                                                    </span>
                                                )}
                                            </div>
                                        ) : LOW_STOCK(book) ? (
                                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-bold">Low ({book.stock})</span>
                                        ) : book.stock !== undefined ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">{book.stock}</span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">—</span>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Link
                                            className="font-medium text-amber-600 hover:underline mr-4"
                                            to={`/vendor/dashboard/edit-books/${book._id}`}
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            className='bg-red-600 px-4 py-1 font-semibold text-white rounded-md hover:bg-red-700 transition-colors'
                                            onClick={() => handleDelete(book._id, book.bookTitle)}
                                        >
                                            Delete
                                        </button>
                                    </Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        ))}
                    </Table>

                    <div className="flex items-center justify-center text-center mt-8">
                        <Pagination
                            currentPage={currentPage}
                            layout="pagination"
                            nextLabel="Next"
                            previousLabel="Prev"
                            onPageChange={page => setCurrentPage(page)}
                            showIcons
                            totalPages={totalPages}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default VendorManageBooks;
