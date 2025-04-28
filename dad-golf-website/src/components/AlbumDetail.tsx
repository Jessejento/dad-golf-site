import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { client, urlFor } from '../lib/sanity'

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

export default function AlbumDetail() {
    const { id } = useParams<{ id: string }>()
    const [album, setAlbum] = useState<Album | null>(null)
    const [selectedImage, setSelectedImage] = useState<number | null>(null)

    useEffect(() => {
        const fetchAlbum = async () => {
            const query = `*[_type == "album" && _id == $id][0] {
        _id,
        name,
        description,
        date,
        images
      }`
            const result = await client.fetch(query, { id })
            setAlbum(result)
        }

        if (id) {
            fetchAlbum()
        }
    }, [id])

    if (!album) {
        return <div className="text-center py-8">Loading...</div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">{album.name}</h1>
            {album.description && (
                <p className="text-gray-600 mb-4">{album.description}</p>
            )}
            {album.date && (
                <p className="text-sm text-gray-500 mb-6">
                    {new Date(album.date).toLocaleDateString()}
                </p>
            )}

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {album.images.map((image, index) => (
                    <div
                        key={image.asset._ref}
                        className="cursor-pointer"
                        onClick={() => setSelectedImage(index)}
                    >
                        <img
                            src={urlFor(image).width(300).height(300).url()}
                            alt={image.alt || `Image ${index + 1}`}
                            className="w-full h-64 object-cover rounded-lg"
                        />
                        {image.caption && (
                            <p className="text-sm text-gray-600 mt-1">{image.caption}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Image Modal */}
            {selectedImage !== null && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="max-w-4xl mx-auto p-4">
                        <img
                            src={urlFor(album.images[selectedImage]).width(1200).url()}
                            alt={album.images[selectedImage].alt || `Image ${selectedImage + 1}`}
                            className="max-h-[90vh] w-auto"
                        />
                        {album.images[selectedImage].caption && (
                            <p className="text-white text-center mt-4">
                                {album.images[selectedImage].caption}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
