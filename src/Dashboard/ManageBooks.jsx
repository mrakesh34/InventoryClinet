import { Table } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import { Pagination } from 'flowbite-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API_BASE from '../utils/api';

const ManageBooks = () => {
    const [allBooks, setAllBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetch(`${API_BASE}/books`)
            .then((res) => res.json())
            .then((data) => {
                setAllBooks(data);
            })
            .catch(() => toast.error('Failed to load books.'));
    }, []);

    // Delete a book
    const handleDelete = (id, title) => {
        const token = localStorage.getItem('bookstore-token');
        const toastId = toast.loading(`Deleting "${title}"...`);
        fetch(`${API_BASE}/books/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then(() => {
                setAllBooks(prev => prev.filter(b => b._id !== id));
                toast.success(`"${title}" deleted successfully.`, { id: toastId });
            })
            .catch(() => toast.error('Failed to delete book.', { id: toastId }));
    };

    // Pagination
    const totalPages = Math.max(1, Math.ceil(allBooks.length / ITEMS_PER_PAGE));
    const paginated = allBooks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const LOW_STOCK = (book) => book.stock !== undefined && book.stock <= (book.lowStockThreshold ?? 5);
    const OUT_OF_STOCK = (book) => book.stock !== undefined && book.stock === 0;

    return (
        <div className='px-4 my-12 w-full max-w-6xl'>
            <h2 className='mb-8 text-3xl font-bold'>📚 Books Inventory</h2>

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
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium">
                                    {book.category}
                                </span>
                            </Table.Cell>
                            <Table.Cell>${book.price?.toFixed(2) ?? '—'}</Table.Cell>
                            <Table.Cell>
                                {OUT_OF_STOCK(book) ? (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">
                                        Out of Stock
                                    </span>
                                ) : LOW_STOCK(book) ? (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-bold">
                                        Low ({book.stock})
                                    </span>
                                ) : book.stock !== undefined ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">
                                        {book.stock}
                                    </span>
                                ) : (
                                    <span className="text-gray-400 text-xs">—</span>
                                )}
                            </Table.Cell>
                            <Table.Cell>
                                <Link
                                    className="font-medium text-cyan-600 hover:underline dark:text-cyan-500 mr-4"
                                    to={`/admin/dashboard/edit-books/${book._id}`}
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

            {/* Pagination */}
            <div className="flex items-center justify-center text-center mt-8">
                <Pagination
                    currentPage={currentPage}
                    layout="pagination"
                    nextLabel="Next"
                    previousLabel="Prev"
                    onPageChange={(page) => setCurrentPage(page)}
                    showIcons
                    totalPages={totalPages}
                />
            </div>
        </div>
    );
};

export default ManageBooks;