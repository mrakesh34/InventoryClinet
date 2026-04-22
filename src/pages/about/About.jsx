import React from 'react';
import { Link } from 'react-router-dom';
import { HiBookOpen, HiShieldCheck, HiUserGroup, HiCube, HiChartBar, HiCreditCard } from 'react-icons/hi';

const TEAM = [
    { name: 'Rakesh Rout', initials: 'RR', color: 'from-blue-500 to-indigo-600' },
    { name: 'Udit Kumar Patel', initials: 'UP', color: 'from-purple-500 to-pink-500' },
    { name: 'Rajalaxmi Sahu', initials: 'RS', color: 'from-orange-400 to-red-500' },
    { name: 'Santosh Barik', initials: 'SB', color: 'from-green-500 to-teal-500' },
];

const FEATURES = [
    { icon: HiBookOpen, title: 'Book Inventory', desc: 'Browse, search, and manage a vast collection of books across multiple categories with real-time stock tracking.' },
    { icon: HiUserGroup, title: 'Multi-Vendor System', desc: 'Vendors can register, list their books, manage inventory, and track earnings — all from a dedicated dashboard.' },
    { icon: HiShieldCheck, title: 'Secure Authentication', desc: 'JWT-based login with email OTP verification at signup. Role-based access control for Users, Vendors, and Admins.' },
    { icon: HiCreditCard, title: 'Stripe Payments', desc: 'Secure online checkout powered by Stripe. Card details never touch our server — fully PCI compliant.' },
    { icon: HiChartBar, title: 'Analytics & Reports', desc: 'Admin dashboard with real-time charts, top sellers, revenue breakdown, category analysis, and inventory valuation.' },
    { icon: HiCube, title: 'Stock Management', desc: 'Complete audit trail of stock-in/stock-out operations. Low stock alerts and automated notifications for out-of-stock items.' },
];

const TECH = [
    { name: 'React.js', desc: 'Frontend UI', emoji: '⚛️' },
    { name: 'Node.js', desc: 'Backend Runtime', emoji: '🟢' },
    { name: 'Express.js', desc: 'REST API Server', emoji: '🚀' },
    { name: 'MongoDB', desc: 'NoSQL Database', emoji: '🍃' },
    { name: 'Stripe', desc: 'Payment Gateway', emoji: '💳' },
    { name: 'JWT', desc: 'Authentication', emoji: '🔐' },
    { name: 'Nodemailer', desc: 'Email OTP', emoji: '📧' },
    { name: 'Cloudinary', desc: 'Image Storage', emoji: '☁️' },
];

const About = () => {
    return (
        <div className='mt-20'>
            {/* ── Hero Section ── */}
            <div className='bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 lg:px-24 py-20'>
                <div className='max-w-4xl mx-auto text-center'>
                    <div className='inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6'>
                        <HiBookOpen className='w-4 h-4' />
                        MCA Final Year Project — USBM
                    </div>
                    <h1 className='text-4xl lg:text-5xl font-extrabold text-gray-900 mb-5 leading-tight'>
                        About <span className='text-blue-600'>Book Vault</span>
                    </h1>
                    <p className='text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed'>
                        Book Vault is a full-stack web-based inventory management system for books, built using the <strong>MERN Stack</strong>. 
                        It enables customers to browse and purchase books, vendors to manage their inventory, and administrators to oversee 
                        the entire platform — including orders, stock tracking, analytics, and vendor settlements.
                    </p>
                </div>
            </div>

            {/* ── Problem & Solution ── */}
            <div className='px-4 lg:px-24 py-16'>
                <div className='max-w-5xl mx-auto grid md:grid-cols-2 gap-10'>
                    <div className='bg-red-50 border border-red-100 rounded-2xl p-8'>
                        <h3 className='text-xl font-bold text-red-700 mb-4'>❌ The Problem</h3>
                        <ul className='space-y-3 text-gray-700 text-sm'>
                            <li className='flex items-start gap-2'><span className='text-red-400 mt-1'>•</span>Traditional bookstores manage inventory manually using registers and spreadsheets</li>
                            <li className='flex items-start gap-2'><span className='text-red-400 mt-1'>•</span>No real-time stock visibility — leading to over-ordering or stock-outs</li>
                            <li className='flex items-start gap-2'><span className='text-red-400 mt-1'>•</span>Customers have no way to browse or buy books online</li>
                            <li className='flex items-start gap-2'><span className='text-red-400 mt-1'>•</span>No centralized platform for multiple book vendors to sell together</li>
                        </ul>
                    </div>
                    <div className='bg-green-50 border border-green-100 rounded-2xl p-8'>
                        <h3 className='text-xl font-bold text-green-700 mb-4'>✅ Our Solution</h3>
                        <ul className='space-y-3 text-gray-700 text-sm'>
                            <li className='flex items-start gap-2'><span className='text-green-500 mt-1'>•</span>Fully digital inventory with real-time stock tracking and audit trails</li>
                            <li className='flex items-start gap-2'><span className='text-green-500 mt-1'>•</span>Online shop with search, filters, cart, and secure Stripe payments</li>
                            <li className='flex items-start gap-2'><span className='text-green-500 mt-1'>•</span>Multi-vendor marketplace — vendors register, list, and manage their own books</li>
                            <li className='flex items-start gap-2'><span className='text-green-500 mt-1'>•</span>Admin dashboard with analytics, reports, and automated commission system</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* ── Key Features ── */}
            <div className='bg-gray-50 px-4 lg:px-24 py-16'>
                <div className='max-w-5xl mx-auto'>
                    <h2 className='text-3xl font-bold text-center text-gray-900 mb-3'>Key Features</h2>
                    <p className='text-center text-gray-500 mb-10'>Everything you need in a modern book management platform</p>
                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {FEATURES.map((f, i) => (
                            <div key={i} className='bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300'>
                                <f.icon className='w-8 h-8 text-blue-600 mb-3' />
                                <h4 className='font-bold text-gray-900 mb-2'>{f.title}</h4>
                                <p className='text-sm text-gray-500 leading-relaxed'>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Tech Stack ── */}
            <div className='px-4 lg:px-24 py-16'>
                <div className='max-w-5xl mx-auto'>
                    <h2 className='text-3xl font-bold text-center text-gray-900 mb-3'>Technology Stack</h2>
                    <p className='text-center text-gray-500 mb-10'>Built with modern, industry-standard technologies</p>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                        {TECH.map((t, i) => (
                            <div key={i} className='bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-blue-300 hover:shadow-md transition-all duration-300'>
                                <span className='text-2xl block mb-2'>{t.emoji}</span>
                                <h5 className='font-bold text-gray-800 text-sm'>{t.name}</h5>
                                <p className='text-xs text-gray-400 mt-1'>{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Team Section ── */}
            <div className='bg-gradient-to-br from-gray-900 to-gray-800 px-4 lg:px-24 py-16'>
                <div className='max-w-4xl mx-auto text-center'>
                    <h2 className='text-3xl font-bold text-white mb-3'>Meet the Team</h2>
                    <p className='text-gray-400 mb-10'>Built with ❤️ by MCA students at USBM, Bhubaneswar</p>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                        {TEAM.map((m, i) => (
                            <div key={i} className='bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-gray-500 transition-all duration-300'>
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg`}>
                                    {m.initials}
                                </div>
                                <h4 className='text-white font-semibold text-sm'>{m.name}</h4>
                                <p className='text-gray-500 text-xs mt-1'>MCA, USBM</p>
                            </div>
                        ))}
                    </div>
                    <p className='text-gray-500 text-sm mt-8'>
                        {/* Project Guide: <span className='text-gray-400 font-medium'>Sudarshen Bera</span> */}
                    </p>
                </div>
            </div>

            {/* ── CTA ── */}
            <div className='px-4 lg:px-24 py-16 text-center'>
                <h2 className='text-2xl font-bold text-gray-900 mb-3'>Ready to explore?</h2>
                <p className='text-gray-500 mb-6'>Browse our collection of books and find your next great read.</p>
                <Link
                    to='/shop'
                    className='inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl'
                >
                    Browse Books →
                </Link>
            </div>
        </div>
    );
};

export default About;