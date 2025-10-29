# Vision Algorithms Website

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or start with custom port
npm run serve

# Build for production
npm run build
```

The website will be available at `http://localhost:3002`

This is the main company website for Vision Algorithms, showcasing our products and company information.

## Overview

The website is built with modern web technologies and follows the design theme of osengine.org. It features:

- Responsive design that works on all devices
- Modern dark theme with blue accents
- Smooth animations and interactions
- Performance-optimized code
- Accessibility features
- NPM-based development workflow
- Company branding with custom logo

## Project Structure

```
VisionAlgorithmsWeb/
├── index.html          # Main website page
├── css/
│   └── style.css       # All styles and responsive design
├── js/
│   └── script.js       # Interactive features and animations
├── images/             # Image assets directory (logo, icons, etc.)
├── public/             # Static assets for deployment
├── package.json        # NPM configuration and scripts
├── .gitignore          # Git ignore rules
├── netlify.toml        # Netlify deployment configuration
├── vercel.json         # Vercel deployment configuration
├── .github/workflows/  # GitHub Actions workflows
└── README.md          # This file
```

## Features

### Main Sections

1. **Navigation** - Fixed header with smooth scrolling navigation
2. **Hero Section** - Company introduction with animated statistics
3. **Products Section** - Showcase of OS Engine with features and stats
4. **About Section** - Company information and mission
5. **Contact Section** - Contact information and social links
6. **Footer** - Links and copyright information

### Interactive Elements

- Smooth scrolling navigation
- Animated statistics counters
- Fade-in animations on scroll
- Hover effects on product cards
- Parallax scrolling in hero section
- Loading states for buttons

## Product Information

The website currently features:

### OS Engine
- **Description**: Turns wallpaper into a living canvas with dynamic videos, custom HTML overlays, and real-time widgets
- **Stats**: 200+ units sold, 200+ active users
- **Platforms**: Available on Steam and standalone
- **Key Features**: Dynamic video wallpapers, custom HTML overlays, web wallpapers, battery optimization

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **JavaScript** - Vanilla JS for interactivity
- **Google Fonts** - Inter font family
- **Responsive Design** - Mobile-first approach
- **NPM** - Package management and development scripts
- **http-server** - Local development server

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Development Commands

```bash
npm run dev      # Start development server with auto-reload
npm run serve    # Start static server
npm run build    # Prepare for production (currently outputs static files)
npm start        # Alias for npm run dev
```

### File Structure

To modify the website:

1. Edit `index.html` for content structure
2. Update `css/style.css` for styling changes
3. Modify `js/script.js` for interactive features
4. Add images to the `images/` directory
5. Update `package.json` for dependencies and scripts
6. Update logo in navigation and favicon

## Deployment

The website can be deployed to any static hosting service:

- Netlify
- Vercel
- GitHub Pages
- Traditional web hosting

### Deployment Options

#### Netlify
1. Connect your Git repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.`
4. Deploy automatically on git push

#### Vercel
1. Connect your Git repository to Vercel
2. Vercel will automatically detect the configuration
3. Deploy automatically on git push

#### GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to GitHub Actions
4. The included workflow will deploy automatically

#### Traditional Hosting
1. **Install dependencies**: `npm install`
2. **Build**: `npm run build`
3. **Upload files**: Deploy the entire project directory to your hosting service
4. **Configure**: Set the document root to the project directory

The website is a static site, so no server-side processing is required.

## Contact

For questions about the website or Vision Algorithms products:
- Email: support@osengine.org
- Discord: https://discord.gg/osengine
- Reddit: https://reddit.com/r/osengine

## License

© 2025 Vision Algorithms. All rights reserved.