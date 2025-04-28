import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
    projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
    dataset: import.meta.env.VITE_SANITY_DATASET,
    useCdn: true,
    apiVersion: '2024-03-13',
    token: import.meta.env.VITE_SANITY_TOKEN
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
    return builder.image(source)
}

// For uploading images
export const writeClient = createClient({
    projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
    dataset: import.meta.env.VITE_SANITY_DATASET,
    useCdn: false,
    apiVersion: '2024-03-13',
    token: import.meta.env.VITE_SANITY_TOKEN
})
