import { useState, useEffect } from 'react'
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

    const fetchAlbums = async () => {
        try {
            setLoading(true)
            const query = `*[_type == "album"] | order(date desc) {
                _id,
                name,
                description,
                date,
                "images": images[] {
                    "asset": asset->,
                    caption,
                    alt
                }
            }`
            console.log('Fetching albums...')
            const result = await client.fetch(query)
            console.log('Fetched albums:', result)
            setAlbums(result)
        } catch (err) {
            console.error('Error fetching albums:', err)
            setError(err instanceof Error ? err.message : 'Error fetching albums')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAlbums()
    }, [])

    const handleDelete = async (e: React.MouseEvent, albumId: string) => {
        e.preventDefault() // Prevent navigation
        if (!confirm('Are you sure you want to delete this album?')) return

        try {
            setDeleting(albumId)
            // Delete the album document
            await writeClient.delete(albumId)
            // Refresh the albums list
            await fetchAlbums()
        } catch (err) {
            console.error('Error deleting album:', err)
            alert('Error deleting album. Please try again.')
        } finally {
            setDeleting(null)
        }
    }

    if (loading) {
        return (
            <div className="text-center py-8 text-gray-500">
                Loading albums...
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-500">
                Error: {error}
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
                        disabled={deleting === album._id}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
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
    )
}
