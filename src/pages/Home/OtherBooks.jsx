import React, { useEffect, useState } from 'react'
import BookCards from '../shared/BookCards';
import API_BASE from '../../utils/api';

const OtherBooks = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE}/books`).then(res => res.json()).then(data => setBooks(data.slice(5, 12)))
    }, [])

    return (
        <div className='mt-24'>
            <BookCards books={books} headline={"Other Books"} />
        </div>
    )
}

export default OtherBooks