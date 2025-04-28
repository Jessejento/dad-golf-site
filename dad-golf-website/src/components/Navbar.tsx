import { Link } from 'react-router-dom'

export default function Navbar() {
    return (
        <nav className="bg-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <img src="/logo.jpg" alt="Jentoooos Golf Logo" className="h-10 w-10 object-contain rounded" />
                        <span className="text-xl font-bold">Jentoooo Golf</span>
                    </Link>
                    <div className="flex space-x-4">
                        <Link
                            to="/"
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                        >
                            Home
                        </Link>
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
                </div>
            </div>
        </nav>
    )
}
