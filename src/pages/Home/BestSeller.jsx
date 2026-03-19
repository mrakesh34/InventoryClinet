import React, { useEffect, useState } from 'react'
import BookCards from '../shared/BookCards';
import API_BASE from '../../utils/api';

const BestSeller = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE}/books`).then(res => res.json()).then(data => setBooks(data.slice(0, 8)))
    }, [])

    return (
        <>
            <BookCards books={books} headline={"Best Seller Books"} />
        </>
    )
}

export default BestSeller