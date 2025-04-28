import { useState, useEffect, useCallback } from 'react'
import { client, writeClient, urlFor } from '../lib/sanity'
import { Link } from 'react-router-dom'

interface Album {
    _id: string
    name: string
    description?: string
    date?: string
    images: {
        asset: {
            _ref: string
        }
        caption?: string
        alt?: string
    }[]
}

export default function AlbumGrid() {
    const [albums, setAlbums] = useState<Album[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)

    const fetchAlbums = useCallback(async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true)
            const query = `*[_type == "album"] | order(date desc) {
                _id,
                name,
                description,
                date,
                "images": images[] {
                    asset,
                    caption,
                    alt
                }
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
    }, [])

    useEffect(() => {
        fetchAlbums()
    }, [fetchAlbums])

    const handleDelete = async (e: React.MouseEvent, albumId: string) => {
        e.preventDefault() // Prevent navigation
        if (!confirm('Are you sure you want to delete this album?')) return

        try {
            setDeleting(albumId)
            // Optimistic update - remove album from UI immediately
            setAlbums(prevAlbums => prevAlbums.filter(album => album._id !== albumId))

            // Delete the album document
            await writeClient.delete(albumId)

            // No need to refetch since we already removed it from the UI
            // Only refetch if there's an error
        } catch (err) {
            console.error('Error deleting album:', err)
            // Revert optimistic update on error by refetching
            await fetchAlbums(true)
            alert('Error deleting album. Please try again.')
        } finally {
            setDeleting(null)
        }
    }

    const handleRefresh = async () => {
        await fetchAlbums(true)
    }

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

    if (albums.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No albums yet. Click "Create New Album" to add one!
            </div>
        )
    }

    return (
        <div className="relative">
            {/* Header with buttons */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Golf Albums</h2>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                </div>
            </div>

            {/* Loading overlay */}
            {refreshing && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((album) => (
                    <div key={album._id} className="relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        <Link to={`/album/${album._id}`}>
                            {album.images?.[0] && (
                                <div className="aspect-w-16 aspect-h-9">
                                    <img
                                        src={urlFor(album.images[0]).width(400).height(300).url()}
                                        alt={album.images[0].alt || album.name}
                                        className="object-cover w-full h-64"
                                    />
                                </div>
                            )}
                            <div className="p-4">
                                <h3 className="text-xl font-semibold mb-2">{album.name}</h3>
                                {album.description && (
                                    <p className="text-gray-600 mb-2">{album.description}</p>
                                )}
                                {album.date && (
                                    <p className="text-sm text-gray-500">
                                        {new Date(album.date).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </Link>
                        <button
                            onClick={(e) => handleDelete(e, album._id)}
                            disabled={deleting !== null}
                            className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${deleting === album._id
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600'
                                } text-white`}
                        >
                            {deleting === album._id ? (
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
