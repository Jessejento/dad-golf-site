import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { client, urlFor } from '../lib/sanity'
import AlbumUpload from '../components/AlbumUpload'

interface Album {
    _id: string
    name: string
    date?: string
    description?: string
    coverImage: {
        asset: {
            _ref: string
        }
    }
}

export default function Pictures() {
    const [albums, setAlbums] = useState<Album[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [showUpload, setShowUpload] = useState(false)

    const fetchAlbums = async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true)
            const query = `*[_type == "album"] | order(date desc) {
                _id,
                name,
                date,
                description,
                "coverImage": images[0]
            }`
            const result = await client.fetch(query)
            setAlbums(result)
            setError(null)
        } catch (err) {
            console.error('Error fetching albums:', err)
            setError(err instanceof Error ? err.message : 'Error fetching albums')
        } finally {
            setLoading(false)
            if (showRefreshing) setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchAlbums()
    }, [])

    if (loading && albums.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-500">Loading albums...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-500">
                Error: {error}
                <button
                    onClick={() => fetchAlbums(true)}
                    className="block mx-auto mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Golf Albums</h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => fetchAlbums(true)}
                        disabled={refreshing}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    <button
                        onClick={() => setShowUpload(true)}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-3 font-semibold text-lg transition-colors"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Create New Album</span>
                    </button>
                </div>
            </div>

            {/* Album Upload Form */}
            {showUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-2xl">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-xl font-semibold">Create New Album</h2>
                            <button
                                onClick={() => setShowUpload(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <AlbumUpload onSuccess={() => { setShowUpload(false); fetchAlbums(true); }} />
                    </div>
                </div>
            )}

            {/* Loading overlay */}
            {refreshing && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Album grid */}
            {albums.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900">No albums yet</h3>
                    <p className="mt-2 text-gray-500">Click "Create New Album" to add your first album.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {albums.map((album) => (
                        <Link
                            key={album._id}
                            to={`/pictures/${album._id}`}
                            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                        >
                            {album.coverImage && (
                                <div className="aspect-w-16 aspect-h-9">
                                    <img
                                        src={urlFor(album.coverImage).width(400).height(225).url()}
                                        alt={album.name}
                                        className="object-cover w-full h-48"
                                    />
                                </div>
                            )}
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900">{album.name}</h3>
                                {album.date && (
                                    <p className="text-gray-600 mt-2">
                                        {new Date(album.date).toLocaleDateString()}
                                    </p>
                                )}
                                {album.description && (
                                    <p className="text-gray-600 mt-2">{album.description}</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
