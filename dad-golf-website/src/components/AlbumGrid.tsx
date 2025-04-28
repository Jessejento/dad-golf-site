import { useState, useEffect } from 'react'
import { client, urlFor } from '../lib/sanity'
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

    useEffect(() => {
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

        fetchAlbums()
    }, [])

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
                <Link
                    key={album._id}
                    to={`/album/${album._id}`}
                    className="block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
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
            ))}
        </div>
    )
}
