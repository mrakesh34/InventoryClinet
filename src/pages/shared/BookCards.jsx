import React, { useContext } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

// import required modules
import { Pagination } from 'swiper/modules';

// react icons
import { FaCartShopping } from "react-icons/fa6"
import { Link } from 'react-router-dom';
import { CartContext } from '../../contexts/CartProvider';

const BookCards = ({headline, books}) => {
    const { addToCart } = useContext(CartContext);

    return (
        <div className='my-16 px-4 lg:px-24'>
            <h2 className='text-5xl my-5 font-bold text-center text-blue-700'>{headline}</h2>

            {/* cards */}
            <div className='mt-20'>
                <Swiper
                    slidesPerView={1}
                    spaceBetween={10}
                    pagination={{
                        clickable: true,
                    }}
                    breakpoints={{
                        640: {
                            slidesPerView: 1,
                            spaceBetween: 20,
                        },
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 40,
                        },
                        1024: {
                            slidesPerView: 4,
                            spaceBetween: 50,
                        },
                    }}
                    modules={[Pagination]}
                    className=" w-full h-full"
                >
                    {
                        books.map(book => <SwiperSlide className='text-center flex items-center justify-center' key={book._id}>
                            <div className='relative w-full text-left'>
                                <Link to={`/book/${book._id}`} className='cursor-pointer group flex flex-col h-[450px]'>
                                    <div className='bg-gray-100 p-8 rounded-lg flex-1 flex justify-center items-center overflow-hidden'>
                                        <img src={book.imageURL} alt={book.bookTitle} className='w-full h-full object-contain group-hover:scale-105 transition-transform duration-300' />
                                    </div>

                                    <div className='mt-5 mb-8 space-y-2 flex justify-between items-start'>
                                        <div className='flex-1 pr-4'>
                                            <h3 className='text-black font-semibold line-clamp-1'>{book.bookTitle}</h3>
                                            <p className='text-sm text-gray-500 line-clamp-1 mb-1'>{book.authorName}</p>
                                            {book.stock === 0 ? (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded text-red-700 bg-red-100">Out of Stock</span>
                                            ) : (book.stock > 0 && book.stock <= (book.lowStockThreshold ?? 5)) ? (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded text-orange-700 bg-orange-100">Only {book.stock} left</span>
                                            ) : null}
                                        </div>
                                        <div>
                                            <p className='font-bold text-blue-700'>${book.price ? book.price.toFixed(2) : "10.00"}</p>
                                        </div>
                                    </div>
                                </Link>

                                {/* Floating Add to Cart Button (Separate from Link to avoid navigation) */}
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        addToCart(book);
                                    }}
                                    disabled={book.stock === 0}
                                    className={`absolute top-3 right-3 p-3 rounded-full shadow-lg transition-all z-10 ${
                                        book.stock === 0 
                                            ? 'bg-gray-300 cursor-not-allowed opacity-50' 
                                            : 'bg-blue-600 hover:bg-blue-800 duration-300 hover:scale-110'
                                    }`}
                                    title={book.stock === 0 ? "Out of Stock" : "Add to Cart"}
                                >
                                    <FaCartShopping className='w-5 h-5 text-white'/>
                                </button>
                            </div>
                        </SwiperSlide>)
                    }
                </Swiper>
            </div>
        </div>
    )
}

export default BookCards