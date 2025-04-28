import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { client, writeClient, urlFor } from '../lib/sanity'

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
    const [files, setFiles] = useState<FileList | null>(null)
    const [uploading, setUploading] = useState(false)
    const [showUpload, setShowUpload] = useState(false)

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

    useEffect(() => {
        if (id) {
            fetchAlbum()
        }
    }, [id])

    const handleAddPhotos = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!files?.length || !album) return

        setUploading(true)
        try {
            // Upload new images
            const newImageAssets = await Promise.all(
                Array.from(files).map(async (file) => {
                    const imageAsset = await writeClient.assets.upload('image', file)
                    return {
                        _type: 'image',
                        asset: {
                            _type: 'reference',
                            _ref: imageAsset._id
                        }
                    }
                })
            )

            // Update the album with new images
            await writeClient
                .patch(album._id)
                .setIfMissing({ images: [] })
                .append('images', newImageAssets)
                .commit()

            // Reset form and refresh album
            setFiles(null)
            setShowUpload(false)
            await fetchAlbum()
            alert('Photos added successfully!')
        } catch (error) {
            console.error('Upload error:', error)
            alert('Error adding photos. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    if (!album) {
        return <div className="text-center py-8">Loading...</div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{album.name}</h1>
                <button
                    onClick={() => setShowUpload(!showUpload)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Photos</span>
                </button>
            </div>

            {album.description && (
                <p className="text-gray-600 mb-4">{album.description}</p>
            )}
            {album.date && (
                <p className="text-sm text-gray-500 mb-6">
                    {new Date(album.date).toLocaleDateString()}
                </p>
            )}

            {/* Upload Form */}
            {showUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Add Photos to Album</h2>
                            <button
                                onClick={() => setShowUpload(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddPhotos} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Photos
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setFiles(e.target.files)}
                                    required
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
                            >
                                {uploading ? 'Adding Photos...' : 'Add Photos'}
                            </button>
                        </form>
                    </div>
                </div>
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
