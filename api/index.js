const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Comic, story, and artwork data cache
let comicData = null;
let storyData = null;
let artworkData = null;
let lastScanTime = null;
const AUTO_REFRESH_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days

// File scanner class
class FileScanner {
    constructor() {
        this.comicsPath = path.join(__dirname, '..', 'comics');
        this.storiesPath = path.join(__dirname, '..', 'literature');
        this.artworkPath = path.join(__dirname, '..', 'artwork');
        this.thumbnailsPath = path.join(__dirname, '..', 'thumbnails');
    }

    // Scan comics directory
    async scanComics() {
        try {
            const series = [];
            const seriesDirs = await this.getDirectories(this.comicsPath);
            
            for (const seriesName of seriesDirs) {
                const seriesPath = path.join(this.comicsPath, seriesName);
                const comics = await this.scanComicSeries(seriesPath, seriesName);
                
                if (comics.length > 0) {
                    series.push({
                        name: seriesName,
                        path: `comics/${seriesName}/`,
                        totalComics: comics.length,
                        lastUpdated: new Date().toISOString(),
                        comics: comics
                    });
                }
            }
            
            return {
                lastUpdated: new Date().toISOString(),
                series: series
            };
        } catch (error) {
            console.error('Error scanning comics:', error);
            return this.getSampleComicData();
        }
    }

    // Scan individual comic series
    async scanComicSeries(seriesPath, seriesName) {
        try {
            const files = await fs.readdir(seriesPath);
            const comics = [];
            
            const imageFiles = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
            });
            
            for (const file of imageFiles) {
                const comicData = await this.parseComicFile(file, seriesName, seriesPath);
                if (comicData) {
                    comics.push(comicData);
                }
            }
            
            // Sort by episode number
            comics.sort((a, b) => a.number - b.number);
            return comics;
        } catch (error) {
            console.error(`Error scanning series ${seriesName}:`, error);
            return [];
        }
    }

    // Parse individual comic file
    async parseComicFile(filename, seriesName, seriesPath) {
        try {
            const filePath = path.join(seriesPath, filename);
            const stats = await fs.stat(filePath);
            
            // Extract episode number and title from filename
            const match = filename.match(/^(\d+)\s*-\s*(.+?)\./);
            const number = match ? parseInt(match[1]) : 0;
            const title = match ? match[2] : path.parse(filename).name;
            
            // Generate thumbnail
            const thumbnailPath = await this.generateThumbnail(filePath, seriesName, filename);
            
            return {
                number: number,
                title: title,
                filename: filename,
                path: `/comics/${seriesName}/${filename}`,
                thumbnail: thumbnailPath,
                extension: path.extname(filename),
                fileSize: stats.size,
                lastModified: stats.mtime.toISOString(),
                series: seriesName
            };
        } catch (error) {
            console.error(`Error parsing comic file ${filename}:`, error);
            return null;
        }
    }

    // Generate thumbnail for comic (simplified for Vercel)
    async generateThumbnail(imagePath, seriesName, filename) {
        // For now, return null to avoid sharp dependency issues in Vercel
        // Thumbnails can be generated locally and uploaded
        return null;
    }

    // Scan stories directory
    async scanStories() {
        try {
            const stories = [];
            const files = await fs.readdir(this.storiesPath);
            
            const textFiles = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.txt', '.md', '.html', '.pdf'].includes(ext);
            });

            for (const file of textFiles) {
                const storyData = await this.parseStoryFile(file);
                if (storyData) {
                    stories.push(storyData);
                }
            }

            // Sort stories by date
            stories.sort((a, b) => new Date(b.date) - new Date(a.date));

            return {
                lastUpdated: new Date().toISOString(),
                stories: stories
            };
        } catch (error) {
            console.error('Error scanning stories:', error);
            return this.getSampleStoryData();
        }
    }

    // Parse individual story file
    async parseStoryFile(filename) {
        const filePath = path.join(this.storiesPath, filename);
        const stats = await fs.stat(filePath);
        const fileExtension = path.extname(filename).toLowerCase();
        
        let title = path.parse(filename).name.replace(/[-_]/g, ' '); // fallback
        let author = 'Unknown';
        let description = '';
        
        try {
            let content = '';
            
            // Handle PDF files (simplified for Vercel)
            if (fileExtension === '.pdf') {
                // For PDFs, just use filename as title for now
                // PDF parsing can be added back later with proper Vercel configuration
                content = `PDF file: ${filename}`;
            } else {
                // Handle text files
                content = await fs.readFile(filePath, 'utf8');
            }
            
            const lines = content.split('\n').map(line => line.trim()).filter(line => line);
            
            // Check if this is Google Docs format (starts with "Chronicles of Max")
            if (lines.length >= 4 && lines[0] === 'Chronicles of Max' && lines[1] === 'A Short Story') {
                // Extract author from line 2: "Author: {Author Name}" or "AUTHOR: {Author Name}"
                if (lines[2].toLowerCase().startsWith('author: ')) {
                    author = lines[2].substring(lines[2].indexOf(': ') + 2); // Remove "Author: " or "AUTHOR: " prefix
                }
                
                // Find the actual story title (first heading after the header)
                // Look for the first line that's not part of the header (after line 3)
                let storyStartIndex = 4;
                for (let i = 4; i < lines.length; i++) {
                    // Skip empty lines and look for the story title
                    if (lines[i] && !lines[i].startsWith('http')) {
                        title = lines[i];
                        storyStartIndex = i + 1;
                        break;
                    }
                }
                
                // Get description from the first few lines of actual story content
                const storyContent = lines.slice(storyStartIndex).join(' ');
                description = storyContent.substring(0, 200);
                if (storyContent.length > 200) {
                    description += '...';
                }
            } else {
                // Fallback to original parsing for non-Google Docs format
                description = lines.slice(0, 3).join(' ').substring(0, 200) + '...';
            }
        } catch (error) {
            console.error(`Error parsing story file ${filename}:`, error);
            // Fallback to filename-based title and basic description
            description = 'Story content could not be parsed.';
        }

        return {
            title: title,
            author: author,
            filename: filename,
            path: `/stories/${filename}`,
            description: description,
            fileSize: stats.size,
            lastModified: stats.mtime.toISOString(),
            date: stats.mtime.toISOString()
        };
    }

    // Scan artwork folders
    async scanArtwork() {
        try {
            const artwork = {
                official: [],
                fanart: []
            };
            
            // Scan official artwork
            const officialPath = path.join(this.artworkPath, 'official');
            try {
                const officialFiles = await fs.readdir(officialPath);
                const imageFiles = officialFiles.filter(file => {
                    const ext = path.extname(file).toLowerCase();
                    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
                });
                
                for (const file of imageFiles) {
                    const artworkData = await this.parseArtworkFile(file, 'official');
                    if (artworkData) {
                        artwork.official.push(artworkData);
                    }
                }
            } catch (error) {
                console.log('No official artwork folder found');
            }
            
            // Scan fan art
            const fanartPath = path.join(this.artworkPath, 'fanart');
            try {
                const fanartFiles = await fs.readdir(fanartPath);
                const imageFiles = fanartFiles.filter(file => {
                    const ext = path.extname(file).toLowerCase();
                    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
                });
                
                for (const file of imageFiles) {
                    const artworkData = await this.parseArtworkFile(file, 'fanart');
                    if (artworkData) {
                        artwork.fanart.push(artworkData);
                    }
                }
            } catch (error) {
                console.log('No fanart folder found');
            }
            
            return {
                lastUpdated: new Date().toISOString(),
                artwork: artwork
            };
        } catch (error) {
            console.error('Error scanning artwork:', error);
            return this.getSampleArtworkData();
        }
    }

    // Parse artwork file
    async parseArtworkFile(filename, category) {
        const filePath = path.join(this.artworkPath, category, filename);
        const stats = await fs.stat(filePath);
        
        // Parse filename: "TITLE - AUTHOR.ext"
        const nameWithoutExt = path.parse(filename).name;
        const parts = nameWithoutExt.split(' - ');
        const title = parts[0] || nameWithoutExt;
        const author = parts[1] || 'Unknown';
        
        return {
            title: title,
            author: author,
            filename: filename,
            path: `/artwork/${category}/${filename}`,
            fileSize: stats.size,
            lastModified: stats.mtime.toISOString(),
            date: stats.mtime.toISOString(),
            category: category
        };
    }

    // Get all directories in a path
    async getDirectories(dirPath) {
        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });
            return items
                .filter(item => item.isDirectory())
                .map(item => item.name)
                .sort();
        } catch (error) {
            console.error('Error reading directory:', error);
            return [];
        }
    }

    // Sample data fallbacks
    getSampleComicData() {
        return {
            lastUpdated: new Date().toISOString(),
            series: [
                {
                    name: 'Series 1',
                    path: 'comics/Series 1/',
                    totalComics: 3,
                    lastUpdated: new Date().toISOString(),
                    comics: [
                        {
                            number: 1,
                            title: 'The Coffee Incident',
                            filename: '01 - The Coffee Incident.jpg',
                            path: '/comics/Series 1/01 - The Coffee Incident.jpg',
                            thumbnail: null,
                            extension: '.jpg',
                            fileSize: 1024000,
                            lastModified: new Date().toISOString(),
                            series: 'Series 1'
                        },
                        {
                            number: 2,
                            title: '3 AM Serenade',
                            filename: '02 - 3 AM Serenade.png',
                            path: '/comics/Series 1/02 - 3 AM Serenade.png',
                            thumbnail: null,
                            extension: '.png',
                            fileSize: 800000,
                            lastModified: new Date().toISOString(),
                            series: 'Series 1'
                        }
                    ]
                }
            ]
        };
    }

    getSampleStoryData() {
        return {
            lastUpdated: new Date().toISOString(),
            stories: [
                {
                    title: 'The Great Fire of London',
                    filename: 'great-fire-london.txt',
                    path: '/stories/great-fire-london.txt',
                    description: 'Max\'s perspective on the 1666 disaster. Spoiler: he didn\'t start it, but he definitely made it worse...',
                    fileSize: 5000,
                    lastModified: new Date().toISOString(),
                    date: '1666-09-02T00:00:00.000Z'
                }
            ]
        };
    }

    getSampleArtworkData() {
        return {
            lastUpdated: new Date().toISOString(),
            artwork: {
                official: [],
                fanart: []
            }
        };
    }
}

const scanner = new FileScanner();

// API Routes
app.get('/api/comics', async (req, res) => {
    try {
        // Check if we need to rescan (every 7 days or if no data)
        const now = Date.now();
        if (!comicData || !lastScanTime || (now - lastScanTime) > AUTO_REFRESH_INTERVAL) {
            console.log('Auto-refreshing comic data...');
            comicData = await scanner.scanComics();
            lastScanTime = now;
        }
        
        res.json({ success: true, data: comicData });
    } catch (error) {
        console.error('Error getting comic data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/stories', async (req, res) => {
    try {
        // Check if we need to rescan (every 7 days or if no data)
        const now = Date.now();
        if (!storyData || !lastScanTime || (now - lastScanTime) > AUTO_REFRESH_INTERVAL) {
            console.log('Auto-refreshing story data...');
            storyData = await scanner.scanStories();
            lastScanTime = now;
        }
        
        res.json({ success: true, data: storyData });
    } catch (error) {
        console.error('Error getting story data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/artwork', async (req, res) => {
    try {
        // Check if we need to rescan (every 7 days or if no data)
        const now = Date.now();
        if (!artworkData || !lastScanTime || (now - lastScanTime) > AUTO_REFRESH_INTERVAL) {
            console.log('Auto-refreshing artwork data...');
            artworkData = await scanner.scanArtwork();
            lastScanTime = now;
        }
        
        res.json({ success: true, data: artworkData });
    } catch (error) {
        console.error('Error getting artwork data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Force rescan endpoints
app.post('/api/comics/scan', async (req, res) => {
    try {
        comicData = await scanner.scanComics();
        res.json({ success: true, data: comicData });
    } catch (error) {
        console.error('Error scanning comics:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/stories/scan', async (req, res) => {
    try {
        storyData = await scanner.scanStories();
        res.json({ success: true, data: storyData });
    } catch (error) {
        console.error('Error scanning stories:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/artwork/scan', async (req, res) => {
    try {
        artworkData = await scanner.scanArtwork();
        res.json({ success: true, data: artworkData });
    } catch (error) {
        console.error('Error scanning artwork:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve comic images
app.get('/comics/:series/:filename', (req, res) => {
    const { series, filename } = req.params;
    const filePath = path.join(__dirname, '..', 'comics', series, filename);
    res.sendFile(filePath);
});

// Serve artwork images
app.get('/artwork/:category/:filename', (req, res) => {
    const { category, filename } = req.params;
    const filePath = path.join(__dirname, '..', 'artwork', category, filename);
    res.sendFile(filePath);
});

// Serve story files
app.get('/stories/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'literature', filename);
    res.sendFile(filePath);
});

// Serve thumbnails
app.get('/thumbnails/:series/:filename', (req, res) => {
    const { series, filename } = req.params;
    const filePath = path.join(__dirname, '..', 'thumbnails', series, filename);
    res.sendFile(filePath);
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Handle all other routes by serving index.html (for client-side routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Initialize data
scanner.scanComics().then(data => {
    comicData = data;
    lastScanTime = Date.now();
    console.log(`✅ Found ${data.series.length} comic series`);
});

scanner.scanStories().then(data => {
    storyData = data;
    console.log(`✅ Found ${data.stories.length} stories`);
});

scanner.scanArtwork().then(data => {
    artworkData = data;
    console.log(`✅ Found ${data.artwork.official.length} official artwork, ${data.artwork.fanart.length} fan art`);
});

module.exports = app;
