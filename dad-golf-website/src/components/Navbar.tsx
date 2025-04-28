import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <nav className="bg-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <img src="/logo.jpg" alt="Jentoooos Golf Logo" className="h-10 w-10 object-contain rounded" />
                        <span className="text-xl font-bold text-gray-800">Jentoooo Golf</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-4">
                        <Link
                            to="/schedule"
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                        >
                            Schedule
                        </Link>
                        <Link
                            to="/pictures"
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                        >
                            Pictures
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isMenuOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-2 space-y-1">
                        <Link
                            to="/schedule"
                            className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Schedule
                        </Link>
                        <Link
                            to="/pictures"
                            className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Pictures
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    )
}
