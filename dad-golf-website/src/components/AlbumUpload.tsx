import { useState } from 'react'
import { writeClient } from '../lib/sanity'

interface AlbumUploadProps {
    onSuccess?: () => void
}

export default function AlbumUpload({ onSuccess }: AlbumUploadProps) {
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
            // First, upload all images
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

            // Then create the album document
            await writeClient.create({
                _type: 'album',
                name,
                description,
                date,
                images: imageAssets
            })

            // Reset form
            setName('')
            setDescription('')
            setDate('')
            setFiles(null)
            onSuccess?.()
            alert('Album created successfully!')
        } catch (error) {
            console.error('Upload error:', error)
            alert('Error creating album. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Create New Album</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Album Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 border rounded"
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Images</label>
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
                    {uploading ? 'Creating Album...' : 'Create Album'}
                </button>
            </form>
        </div>
    )
}
