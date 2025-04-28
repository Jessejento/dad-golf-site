import { useState, useEffect, useCallback } from 'react'
import { client, writeClient, urlFor } from '../lib/sanity'
import { format } from 'date-fns'
import EventUpload from '../components/EventUpload'

interface Event {
    _id: string
    title: string
    startDate: string
    endDate: string
    description?: string
    location?: string
    image?: {
        asset: {
            _ref: string
        }
    }
}

export default function Schedule() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [showUpload, setShowUpload] = useState(false)

    const fetchEvents = useCallback(async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true)
            const query = `*[_type == "event"] | order(startDate desc) {
                _id,
                title,
                startDate,
                endDate,
                description,
                location,
                image
            }`
            const result = await client.fetch(query)
            setEvents(result)
            setError(null)
        } catch (err) {
            console.error('Error fetching events:', err)
            setError(err instanceof Error ? err.message : 'Error fetching events')
        } finally {
            setLoading(false)
            if (showRefreshing) setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    const handleDelete = async (eventId: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return

        try {
            // Optimistic update
            setEvents(prev => prev.filter(event => event._id !== eventId))
            await writeClient.delete(eventId)
        } catch (err) {
            console.error('Error deleting event:', err)
            // Revert on error
            await fetchEvents(true)
            alert('Error deleting event. Please try again.')
        }
    }

    const getEventStatus = (startDate: string, endDate: string) => {
        const now = new Date()
        const start = new Date(startDate)
        const end = new Date(endDate)

        if (now < start) {
            return { text: 'Upcoming', className: 'bg-blue-100 text-blue-800' }
        } else if (now > end) {
            return { text: 'Completed', className: 'bg-gray-100 text-gray-800' }
        } else {
            return { text: 'Current', className: 'bg-green-100 text-green-800' }
        }
    }

    if (loading && events.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-500">Loading events...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-500">
                Error: {error}
                <button
                    onClick={() => fetchEvents(true)}
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
                <h1 className="text-3xl font-bold text-gray-900">Golf Events</h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => fetchEvents(true)}
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
                        <span>Create New Event</span>
                    </button>
                </div>
            </div>

            {/* Event Upload Form */}
            {showUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-2xl">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-xl font-semibold">Create New Event</h2>
                            <button
                                onClick={() => setShowUpload(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <EventUpload />
                    </div>
                </div>
            )}

            {/* Loading overlay */}
            {refreshing && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Event grid */}
            {events.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900">No events yet</h3>
                    <p className="mt-2 text-gray-500">Click "Create New Event" to add your first event.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => {
                        const status = getEventStatus(event.startDate, event.endDate)
                        return (
                            <div key={event._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                {/* Event image */}
                                {event.image && (
                                    <div className="aspect-w-16 aspect-h-9">
                                        <img
                                            src={urlFor(event.image).width(400).height(225).url()}
                                            alt={event.title}
                                            className="object-cover w-full h-48"
                                        />
                                    </div>
                                )}

                                {/* Event content */}
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                                        <span className={`px-2 py-1 text-sm rounded-full ${status.className}`}>
                                            {status.text}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center text-gray-600">
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <div>
                                                <div>{format(new Date(event.startDate), 'MMM d, yyyy')}</div>
                                                <div>to {format(new Date(event.endDate), 'MMM d, yyyy')}</div>
                                            </div>
                                        </div>

                                        {event.location && (
                                            <div className="flex items-center text-gray-600">
                                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>{event.location}</span>
                                            </div>
                                        )}

                                        {event.description && (
                                            <p className="text-gray-600 mt-2">{event.description}</p>
                                        )}
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        onClick={() => handleDelete(event._id)}
                                        className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors w-full flex items-center justify-center"
                                    >
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete Event
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
