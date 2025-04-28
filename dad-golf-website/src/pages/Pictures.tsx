import { useState } from 'react'
import AlbumGrid from '../components/AlbumGrid'
import { writeClient } from '../lib/sanity'

export default function Pictures() {
    const [showUploadForm, setShowUploadForm] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState('')
    const [files, setFiles] = useState<FileList | null>(null)
    const [uploading, setUploading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!files?.length) return

        setUploading(true)
        try {
            const imageAssets = await Promise.all(
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

            await writeClient.create({
                _type: 'album',
                name,
                description,
                date,
                images: imageAssets
            })

            setName('')
            setDescription('')
            setDate('')
            setFiles(null)
            setShowUploadForm(false)
            alert('Album created successfully!')
            window.location.reload() // Refresh to show new album
        } catch (error) {
            console.error('Upload error:', error)
            alert('Error creating album. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="w-full min-h-screen bg-gray-50 px-8 py-16">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Golf Albums</h1>
                    <button
                        onClick={() => setShowUploadForm(!showUploadForm)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                        {showUploadForm ? 'Hide Upload Form' : 'Create New Album'}
                    </button>
                </div>

                {showUploadForm && (
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-12 border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Album</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Album Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter album name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Enter album description"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Images</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setFiles(e.target.files)}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400"
                            >
                                {uploading ? 'Creating Album...' : 'Create Album'}
                            </button>
                        </form>
                    </div>
                )}

                <AlbumGrid />
            </div>
        </div>
    )
}
