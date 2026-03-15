import React, { useContext, useEffect, useState } from 'react'
import { Card, Spinner } from 'flowbite-react';
import { AuthContext } from '../../contexts/AuthProvider';
import { CartContext } from '../../contexts/CartProvider';

export default function Shop() {
  const { loading } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const [books, setBooks] = useState([]);

  // fetching data
  useEffect(() =>{
    fetch('http://localhost:5000/api/books')
    .then(res => res.json())
    .then(data => setBooks(data))
  }, [loading]);

  // loader
  if (loading) {
    return <div className="text-center mt-28">
        <Spinner aria-label="Center-aligned spinner example" />
    </div>
  }

  return (
    <div className='my-28 px-4 lg:px-24'>
      <h2 className='text-3xl font-bold text-center mb-16 z-40 text-blue-700'>All Books are Available Here</h2>
        <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8'>
          {
            books.map(book => <Card key={book._id}>
              <img src={book.imageURL} alt="" className='h-96 object-fill' />
              <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                <p>
                  {book.bookTitle}
                </p>
              </h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                <p>
                  {book.bookDescription ? book.bookDescription.substring(0, 100) + '...' : "Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order...."}
                </p>
              </p>

              <button 
                onClick={() => addToCart(book)}
                className='mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 active:scale-95'
              >
                Add to Cart
              </button>
            </Card>)
          }
        </div>
    </div>
  )
}
