import React, { useContext } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { CartContext } from '../../contexts/CartProvider';
import { MdShoppingCart } from 'react-icons/md';

const SignleBook = () => {
    const data = useLoaderData();
    const navigate = useNavigate();
    const { _id, bookTitle, authorName, imageURL, category, bookDescription, price } = data;
    const { addToCart } = useContext(CartContext);

    return (
        <div className='mt-28 px-4 lg:px-24 mb-16'>
            <button 
                onClick={() => navigate(-1)} 
                className="mb-8 text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
                ← Back to previous page
            </button>
            <div className='flex flex-col md:flex-row gap-12 bg-white p-8 rounded-2xl shadow-lg border border-gray-100'>
                {/* Book Image */}
                <div className='md:w-1/3 flex justify-center'>
                    <img src={imageURL} alt={bookTitle} className='w-full max-w-[300px] rounded-lg shadow-xl object-contain' />
                </div>

                {/* Book Details */}
                <div className='md:w-2/3 flex flex-col justify-center'>
                    <div className='mb-2'>
                        <span className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold tracking-wide uppercase'>
                            {category || 'Uncategorized'}
                        </span>
                    </div>
                    
                    <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight'>
                        {bookTitle}
                    </h1>
                    
                    <p className='text-xl text-gray-500 font-medium mb-6 flex items-center gap-2'>
                        By <span className='text-gray-800'>{authorName}</span>
                    </p>
                    
                    <p className='text-gray-600 text-lg leading-relaxed mb-8'>
                        {bookDescription || "A fascinating book that you will definitely enjoy reading. It explores various themes and keeps you hooked from start to finish."}
                    </p>

                    <div className='flex flex-col sm:flex-row sm:items-center gap-6 mt-auto border-t border-gray-100 pt-8'>
                        <div className='text-4xl font-black text-blue-700'>
                            ${price ? price.toFixed(2) : '10.00'}
                        </div>
                        
                        <button 
                            onClick={() => addToCart(data)}
                            className='flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95'
                        >
                            <MdShoppingCart className='w-6 h-6' />
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignleBook;