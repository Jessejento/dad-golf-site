export default {
    name: 'album',
    title: 'Album',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Album Name',
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
            of: [{ type: 'image' }],
            options: {
                layout: 'grid'
            }
        }
    ]
}
