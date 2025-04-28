import { Link } from 'react-router-dom'

export default function Home() {
    return (
        <div className="w-full min-h-screen bg-gray-50 px-8 py-16">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl font-extrabold text-gray-800 mb-12">Welcome to Jentoooo Golf</h1>
                <p className="text-xl text-gray-600 mb-12">
                    Track our golf adventures, view upcoming schedules, and browse through photos of our games.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Link to="/schedule" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-100 hover:border-blue-200">
                        <h2 className="text-3xl font-bold mb-4 text-blue-700">Schedule</h2>
                        <p className="text-gray-600 text-lg">
                            View upcoming golf games and events. Stay organized and never miss a tee time.
                        </p>
                    </Link>
                    <Link to="/pictures" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-100 hover:border-blue-200">
                        <h2 className="text-3xl font-bold mb-4 text-blue-700">Photo Albums</h2>
                        <p className="text-gray-600 text-lg">
                            Browse through photos from our golf outings and keep memories of our best games.
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    )
}
