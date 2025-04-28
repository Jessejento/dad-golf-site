# Dad's Golf Website

A website to showcase golf outings and memories, built with React and Sanity.io.

## Project Structure

- `dad-golf-website/` - React frontend built with Vite
- `dad-golf-studio/` - Sanity Studio CMS

## Setup Instructions

### Frontend (dad-golf-website)

1. Navigate to the frontend directory:
```bash
cd dad-golf-website
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Sanity token:
```bash
VITE_SANITY_TOKEN=your_token_here
```

4. Start the development server:
```bash
npm run dev
```

### Sanity Studio (dad-golf-studio)

1. Navigate to the Sanity Studio directory:
```bash
cd dad-golf-studio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Deployment

- Frontend is deployed on Netlify
- Sanity Studio is deployed on Sanity's hosting

## Features

- Photo album creation and management
- Golf schedule tracking
- Responsive design
- Real-time content updates through Sanity
