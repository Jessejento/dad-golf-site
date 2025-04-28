import { useState } from 'react'
import { writeClient } from '../lib/sanity'

export default function EventUpload() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [location, setLocation] = useState('')
    const [image, setImage] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setUploading(true)
        try {
            // Upload image if provided
            let imageAsset = null
            if (image) {
                const uploadedImage = await writeClient.assets.upload('image', image)
                imageAsset = {
                    _type: 'image',
                    asset: {
                        _type: 'reference',
                        _ref: uploadedImage._id
                    }
                }
            }

            // Create the event document with start of day for dates
            const startDateTime = new Date(startDate)
            startDateTime.setHours(0, 0, 0, 0)
            const endDateTime = new Date(endDate)
            endDateTime.setHours(23, 59, 59, 999)

            await writeClient.create({
                _type: 'event',
                title,
                description,
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
                location,
                status: 'upcoming', // Default status
                ...(imageAsset && { image: imageAsset })
            })

            // Reset form
            setTitle('')
            setDescription('')
            setStartDate('')
            setEndDate('')
            setLocation('')
            setImage(null)
            alert('Event created successfully!')
        } catch (error) {
            console.error('Upload error:', error)
            alert('Error creating event. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Your Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Event Title"
                    className="w-full p-3 bg-black text-white placeholder-gray-400 rounded border border-gray-700"
                />

                {/* Description */}
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full p-3 bg-black text-white placeholder-gray-400 rounded border border-gray-700"
                    rows={3}
                />

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        placeholder="Start Date (MM/DD/YYYY)"
                        className="w-full p-3 bg-black text-white placeholder-gray-400 rounded border border-gray-700"
                        onFocus={(e) => e.target.type = 'date'}
                        onBlur={(e) => {
                            e.target.type = 'text'
                            if (!e.target.value) {
                                e.target.placeholder = 'Start Date (MM/DD/YYYY)'
                            }
                        }}
                    />
                    <input
                        type="text"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        placeholder="End Date (MM/DD/YYYY)"
                        className="w-full p-3 bg-black text-white placeholder-gray-400 rounded border border-gray-700"
                        onFocus={(e) => e.target.type = 'date'}
                        onBlur={(e) => {
                            e.target.type = 'text'
                            if (!e.target.value) {
                                e.target.placeholder = 'End Date (MM/DD/YYYY)'
                            }
                        }}
                    />
                </div>

                {/* Location */}
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Golf Course Name"
                    className="w-full p-3 bg-black text-white placeholder-gray-400 rounded border border-gray-700"
                />

                {/* Image Upload */}
                <button
                    type="button"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="w-full p-3 bg-black text-white border border-gray-700 rounded flex items-center justify-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{image ? 'Image Selected' : 'Choose Image'}</span>
                </button>
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="hidden"
                />

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-blue-500 text-white p-3 rounded font-medium"
                >
                    Create Event
                </button>
            </form>
        </div>
    )
}
