import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const REVIEWS = [
    {
        name: 'Priya Sharma',
        role: 'B.Tech Student, Delhi',
        rating: 5,
        text: 'Amazing collection of programming books! I found all my semester books here at much lower prices than the local store. Delivery was super fast and the books were in perfect condition. Highly recommended for students!',
        initials: 'PS',
        color: 'bg-pink-500',
    },
    {
        name: 'Arjun Patel',
        role: 'Software Developer, Bangalore',
        rating: 5,
        text: 'Book Vault has become my go-to for tech books. The search feature makes it so easy to find exactly what I need. I ordered 4 books and they arrived within 3 days. Great packaging too!',
        initials: 'AP',
        color: 'bg-blue-600',
    },
    {
        name: 'Sneha Reddy',
        role: 'MCA Student, Hyderabad',
        rating: 4,
        text: 'Really good platform for buying academic books. The prices are reasonable and the vendor system means you get variety. I got all my final year project reference books from here. Just wish they had more regional language books.',
        initials: 'SR',
        color: 'bg-purple-500',
    },
    {
        name: 'Rohit Kumar',
        role: 'Book Collector, Patna',
        rating: 5,
        text: 'Finally a reliable online bookstore that actually delivers on time! The UI is clean and easy to navigate. I love the wishlist feature — I add books and buy them when I have budget. 10/10 experience!',
        initials: 'RK',
        color: 'bg-green-600',
    },
    {
        name: 'Ananya Mishra',
        role: 'Teacher, Bhubaneswar',
        rating: 5,
        text: 'I ordered books for my school library and the bulk pricing was excellent. The admin team was very helpful in processing my order. The stock tracking feature is a bonus — I always know what is available before ordering.',
        initials: 'AM',
        color: 'bg-orange-500',
    },
];

const Stars = ({ rating }) => (
    <div className='flex gap-1 text-amber-400 text-lg'>
        {[1, 2, 3, 4, 5].map(i =>
            i <= Math.floor(rating) ? <FaStar key={i} />
            : i - 0.5 <= rating ? <FaStarHalfAlt key={i} />
            : <FaRegStar key={i} />
        )}
    </div>
);

const Review = () => {
    return (
        <div className='my-16 px-4 lg:px-24'>
            <h2 className='text-4xl font-bold text-center mb-2 leading-snug'>What Our Customers Say</h2>
            <p className='text-center text-gray-500 mb-10'>Real reviews from real readers across India</p>

            <Swiper
                slidesPerView={1}
                spaceBetween={24}
                pagination={{ clickable: true }}
                modules={[Pagination]}
                breakpoints={{
                    640: { slidesPerView: 1, spaceBetween: 20 },
                    768: { slidesPerView: 2, spaceBetween: 24 },
                    1024: { slidesPerView: 3, spaceBetween: 30 },
                }}
                className="mySwiper pb-12"
            >
                {REVIEWS.map((review, idx) => (
                    <SwiperSlide key={idx}>
                        <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full flex flex-col'>
                            {/* Stars */}
                            <Stars rating={review.rating} />

                            {/* Review text */}
                            <p className='mt-4 text-gray-600 text-sm leading-relaxed flex-1'>
                                "{review.text}"
                            </p>

                            {/* User info */}
                            <div className='flex items-center gap-3 mt-5 pt-4 border-t border-gray-100'>
                                <div className={`w-10 h-10 rounded-full ${review.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                                    {review.initials}
                                </div>
                                <div>
                                    <h5 className='text-sm font-semibold text-gray-800'>{review.name}</h5>
                                    <p className='text-xs text-gray-400'>{review.role}</p>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Review;