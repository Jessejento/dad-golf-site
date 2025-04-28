export default {
    name: 'album',
    title: 'Album',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: Rule => Rule.required()
        },
        {
            name: 'description',
            title: 'Description',
            type: 'text'
        },
        {
            name: 'date',
            title: 'Date',
            type: 'date'
        },
        {
            name: 'images',
            title: 'Images',
            type: 'array',
            of: [
                {
                    type: 'image',
                    options: {
                        hotspot: true,
                    },
                    fields: [
                        {
                            name: 'caption',
                            type: 'string',
                            title: 'Caption',
                            options: {
                                isHighlighted: true
                            }
                        },
                        {
                            name: 'alt',
                            type: 'string',
                            title: 'Alternative text',
                            description: 'Important for SEO and accessibility.',
                            options: {
                                isHighlighted: true
                            }
                        }
                    ]
                }
            ],
            options: {
                layout: 'grid'
            }
        }
    ]
}
