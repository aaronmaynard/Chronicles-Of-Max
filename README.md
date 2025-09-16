# The Chronicles of Max - Comic Website

A modern, responsive Node.js website for hosting "The Chronicles of Max" comic series featuring an exiled demon cat's adventures throughout history.

## Features

- **Automatic Comic Series Management**: Automatically scans and organizes comics by series
- **Dynamic Story Loading**: Automatically detects and displays short stories (supports PDF and text files)
- **Automatic Thumbnail Generation**: Creates thumbnails for all comic images
- **Local Artwork Gallery**: Dynamic artwork loading from local folders (official and fan art)
- **Node.js Backend**: No PHP required - runs locally with Node.js
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Interactive Elements**: Click Max for random quotes, comic modals, and special effects
- **Multiple Content Sections**: Comics, Short Stories, and Artwork
- **Automated Deployment**: GitHub Actions for continuous deployment
- **Dark Theme**: Atmospheric design matching Max's demonic personality

## Comic Organization System

### Folder Structure

Create your comic folders in the following structure:

```
comics/
├── Series 1/
│   ├── 01 - The Coffee Incident.jpg
│   ├── 02 - 3 AM Serenade.png
│   └── 03 - Gravity is My Friend.gif
├── Series 2/
│   ├── 01 - The Great Fire of London.jpg
│   └── 02 - The Trojan Cat.png
└── Series 3/
    └── 01 - Latest Strip.jpg
```

### Naming Convention

- **Series Folders**: Name them "Series 1", "Series 2", etc.
- **Comic Files**: Use the format `## - Comic Title.ext`
  - `##` = Two-digit number (01, 02, 03, etc.)
  - `Comic Title` = The title of your comic strip
  - `.ext` = Image file extension (jpg, png, gif, webp, svg)

### Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)

## Setup Instructions

### Quick Start (Recommended)

1. **Install Node.js** (version 14 or higher) from [nodejs.org](https://nodejs.org/)

2. **Clone or download** this project to your local machine

3. **Run the setup script**:
   ```bash
   npm run setup
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

6. **Open your browser** to `http://localhost:3000`

## 🚀 Automated Deployment

The project includes GitHub Actions for automated deployment to multiple platforms:

### Option 1: Vercel (Recommended)
1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Add these secrets to your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `ORG_ID`: Your Vercel organization ID
   - `PROJECT_ID`: Your Vercel project ID

### Option 2: Railway
1. Create a Railway account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add this secret to your GitHub repository:
   - `RAILWAY_TOKEN`: Your Railway API token

### Option 3: Manual Deployment
The GitHub Actions will automatically test your code on every push. For manual deployment:
1. Push your changes to the `main` branch
2. The workflow will automatically test and deploy (if secrets are configured)

## 📸 Local Artwork Gallery

The artwork section is designed to integrate with Instagram for dynamic content:

### **Hashtag System**
- **#officialart** - Official artwork from the creator (includes concept art)
- **#fanart** - Fan-created artwork

### **Setup Instructions** (When Ready)
1. Create Instagram account: `@Max_In_Exile`
2. Set up Instagram Basic Display API
3. Configure environment variables
4. Update server.js with Instagram API credentials

### **Current Status**
- ✅ Placeholder UI implemented
- ✅ Hashtag-based sorting structure
- ✅ API endpoints prepared
- ⏳ Instagram API integration pending

### Manual Setup

1. **Install Node.js** (version 14 or higher)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create directories**:
   ```bash
   mkdir comics stories thumbnails
   mkdir "comics/Series 1" "comics/Series 2" "comics/Series 3"
   ```

4. **Add your comics and stories** to the appropriate folders

5. **Start the server**:
   ```bash
   npm start
   ```

### Development Mode

For development with auto-restart:
```bash
npm run dev
```

## Automatic Features

### Series Tabs
- Automatically populated based on your folder structure
- Shows comic count for each series
- Click to switch between series

### Comic Grid
- Displays all comics in the selected series
- Automatically sorted by comic number
- Shows thumbnails (auto-generated) or fallback scenes
- Click any comic to view full size

### Featured Comic
- Automatically shows the first comic of the selected series
- Updates when switching series

### Thumbnail Generation
- Automatically creates 300x300px thumbnails using Sharp
- Saves to `thumbnails/` subfolder in each series
- Supports all image formats (JPG, PNG, GIF, WebP, SVG)
- Fallback to animated scenes if thumbnails fail
- Thumbnails are regenerated when source images change

### Story Management
- Automatically scans `stories/` folder for text files
- Supports `.txt`, `.md`, and `.html` files
- Extracts titles from filenames
- Generates descriptions from file content
- Click stories to read full content

## Customization

### Adding New Series
1. Create a new folder named "Series X" (where X is the next number)
2. Add your comic files with proper naming
3. Run the scanner or refresh the page

### Adding New Comics
1. Add your comic file to the appropriate series folder
2. Use the naming convention: `## - Comic Title.ext`
3. The website will automatically detect and display it

### Modifying Comic Data
- The Node.js server automatically scans and updates data
- No manual JSON editing required
- Server caches data and rescan every 5 minutes
- Force rescan by visiting `/api/comics/scan` endpoint

## Interactive Features

### Max Character
- Click Max in the hero section for random sarcastic quotes
- Animated with floating, blinking, and tail-swishing effects

### Comic Viewer
- Click any comic to open full-size viewer
- Modal popup with comic details
- Easy navigation and closing

### Artwork Gallery
- Three tabs: Official Art, Guest Art, Concept Art
- Guest art submission modal with guidelines
- Responsive grid layout

### Easter Eggs
- **Konami Code**: ↑↑↓↓←→←→BA for special "Max Mode"
- **Random Glitch Effects**: Occasional text glitching
- **Cursor Changes**: Random demon cat cursor on hover

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## File Structure

```
/
├── index.html              # Main website file
├── styles.css              # All styling and animations
├── script.js               # Interactive features and comic loading
├── server.js               # Node.js server with API endpoints
├── package.json            # Node.js dependencies and scripts
├── setup.js                # Setup script for initial configuration
├── README.md               # This file
├── comics/                 # Your comic folders go here
│   ├── Series 1/
│   ├── Series 2/
│   └── Series 3/
├── stories/                # Your story files go here
└── thumbnails/             # Auto-generated thumbnails
    ├── Series 1/
    ├── Series 2/
    └── Series 3/
```

## Troubleshooting

### Comics Not Showing
1. Check folder structure matches the expected format
2. Ensure comic files follow naming convention
3. Make sure the Node.js server is running (`npm start`)
4. Check browser console for JavaScript errors
5. Visit `http://localhost:3000/api/comics` to see raw data

### Thumbnails Not Generating
1. Ensure Sharp package is installed (`npm install`)
2. Check file permissions on comic folders
3. Verify image files are valid and not corrupted
4. Check server console for thumbnail generation errors

### Website Not Loading
1. Make sure Node.js is installed (version 14+)
2. Run `npm install` to install dependencies
3. Start the server with `npm start`
4. Check that port 3000 is not in use
5. Verify all files are in the correct locations

## Support

For issues or questions about the website:
- Check the browser console for error messages
- Verify your folder structure matches the requirements
- Ensure all files are properly uploaded

## License

This website template is created for "The Chronicles of Max" comic series. Feel free to modify and use for your own projects.

---

**Max's Note**: "Finally, a website worthy of my chaos. Now go create some comics and stop bothering me with technical questions." - Max, Demon Cat Supreme
