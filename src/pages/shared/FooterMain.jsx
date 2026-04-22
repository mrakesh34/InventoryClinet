import { Link } from 'react-router-dom';
import { BsGithub } from 'react-icons/bs';
import { HiBookOpen, HiMail, HiLocationMarker } from 'react-icons/hi';

const FooterMain = () => {
    return (
        <footer className="bg-gray-900 text-gray-400 w-full overflow-x-hidden">
            {/* Main footer content */}
            <div className="px-6 lg:px-16 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Brand */}
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-3">
                            <HiBookOpen className="w-7 h-7 text-blue-500" />
                            <span className="text-xl font-bold text-white tracking-tight">
                                Book <span className="text-blue-500">Vault</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
                            A full-stack inventory management platform for books.
                            Browse, buy, and manage — all in one place.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
                            <li><Link to="/shop" className="hover:text-blue-400 transition-colors">Shop</Link></li>
                            <li><Link to="/about" className="hover:text-blue-400 transition-colors">About</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Contact</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <HiMail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <span>support@bookvault.com</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <HiLocationMarker className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <span>USBM, Bhubaneswar</span>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-800">
                <div className="px-6 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} Book Vault. All rights reserved.
                    </p>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                       className="text-gray-500 hover:text-white transition-colors">
                        <BsGithub className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default FooterMain;