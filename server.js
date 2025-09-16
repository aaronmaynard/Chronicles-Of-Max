const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const pdfParse = require('pdf-parse');

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

// Auto-refresh settings
const AUTO_REFRESH_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// File scanning utilities
class FileScanner {
    constructor() {
        this.comicsPath = path.join(__dirname, 'comics');
        this.storiesPath = path.join(__dirname, 'literature'); // Changed from 'stories' to 'literature'
        this.thumbnailsPath = path.join(__dirname, 'thumbnails');
        this.artworkPath = path.join(__dirname, 'artwork');
    }

    // Scan all comics and organize by series
    async scanComics() {
        try {
            const series = [];
            const seriesDirs = await this.getDirectories(this.comicsPath);
            
            for (const seriesDir of seriesDirs) {
                const seriesPath = path.join(this.comicsPath, seriesDir);
                const seriesData = await this.scanSeries(seriesPath, seriesDir);
                
                if (seriesData.comics.length > 0) {
                    series.push(seriesData);
                }
            }
            
            // Sort series by name
            series.sort((a, b) => a.name.localeCompare(b.name));
            
            return {
                lastUpdated: new Date().toISOString(),
                series: series
            };
        } catch (error) {
            console.error('Error scanning comics:', error);
            return this.getSampleComicData();
        }
    }

    // Scan a single series directory
    async scanSeries(seriesPath, seriesName) {
        const comics = [];
        const files = await fs.readdir(seriesPath);
        
        // Filter for image files
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
        });

        for (const file of imageFiles) {
            const comicData = await this.parseComicFile(seriesPath, file, seriesName);
            if (comicData) {
                comics.push(comicData);
            }
        }

        // Sort comics by number
        comics.sort((a, b) => a.number - b.number);

        return {
            name: seriesName,
            path: seriesPath,
            comics: comics,
            totalComics: comics.length,
            lastUpdated: new Date().toISOString()
        };
    }

    // Parse individual comic file
    async parseComicFile(seriesPath, filename, seriesName) {
        const filePath = path.join(seriesPath, filename);
        const stats = await fs.stat(filePath);
        
        // Extract number and title from filename
        // Expected format: "01 - Strip Title.jpg", "01-Strip Title.png", or "E01 - Example Comic.png"
        let number, title;
        const match = filename.match(/^(E?\d+)\s*[-–]\s*(.+?)\.([^.]+)$/i);
        
        if (match) {
            // Remove 'E' prefix if present (like E01, E02)
            const numberStr = match[1].replace(/^E/i, '');
            number = parseInt(numberStr);
            title = match[2].trim();
        } else {
            // Fallback: use filename without extension
            const pathInfo = path.parse(filename);
            title = pathInfo.name;
            number = 1;
        }

        // Generate thumbnail
        const thumbnailPath = await this.generateThumbnail(filePath, seriesName, filename);

        return {
            number: number,
            title: title,
            filename: filename,
            path: `/comics/${seriesName}/${filename}`,
            thumbnail: thumbnailPath,
            extension: path.extname(filename).toLowerCase(),
            fileSize: stats.size,
            lastModified: stats.mtime.toISOString(),
            series: seriesName
        };
    }

    // Generate thumbnail for comic
    async generateThumbnail(sourcePath, seriesName, filename) {
        try {
            const thumbnailDir = path.join(this.thumbnailsPath, seriesName);
            await fs.mkdir(thumbnailDir, { recursive: true });
            
            const thumbnailFilename = path.parse(filename).name + '_thumb.jpg';
            const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
            
            // Check if thumbnail already exists and is newer than source
            try {
                const sourceStats = await fs.stat(sourcePath);
                const thumbnailStats = await fs.stat(thumbnailPath);
                
                if (thumbnailStats.mtime > sourceStats.mtime) {
                    return `/thumbnails/${seriesName}/${thumbnailFilename}`;
                }
            } catch (error) {
                // Thumbnail doesn't exist, create it
            }

            // Generate thumbnail using Sharp
            await sharp(sourcePath)
                .resize(300, 300, { 
                    fit: 'inside',
                    withoutEnlargement: true,
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .jpeg({ quality: 85 })
                .toFile(thumbnailPath);

            return `/thumbnails/${seriesName}/${thumbnailFilename}`;
        } catch (error) {
            console.error('Error generating thumbnail:', error);
            return null;
        }
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
            
            // Handle PDF files
            if (fileExtension === '.pdf') {
                const pdfBuffer = await fs.readFile(filePath);
                const pdfData = await pdfParse(pdfBuffer);
                content = pdfData.text;
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
                const imageFiles = officialFiles.filter(file => 
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
                );

                for (const file of imageFiles) {
                    const artworkItem = await this.parseArtworkFile(file, 'official');
                    if (artworkItem) {
                        artwork.official.push(artworkItem);
                    }
                }
            } catch (error) {
                console.log('Official artwork folder not found or empty');
            }

            // Scan fan art
            const fanartPath = path.join(this.artworkPath, 'fanart');
            try {
                const fanartFiles = await fs.readdir(fanartPath);
                const imageFiles = fanartFiles.filter(file => 
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
                );

                for (const file of imageFiles) {
                    const artworkItem = await this.parseArtworkFile(file, 'fanart');
                    if (artworkItem) {
                        artwork.fanart.push(artworkItem);
                    }
                }
            } catch (error) {
                console.log('Fan art folder not found or empty');
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

    // Parse individual artwork file
    async parseArtworkFile(filename, category) {
        const filePath = path.join(this.artworkPath, category, filename);
        const stats = await fs.stat(filePath);
        
        // Parse filename format: "TITLE - AUTHOR.ext"
        const nameWithoutExt = path.parse(filename).name;
        const titleAuthorMatch = nameWithoutExt.match(/^(.+?)\s*-\s*(.+)$/);
        
        let title, author;
        if (titleAuthorMatch) {
            title = titleAuthorMatch[1].trim();
            author = titleAuthorMatch[2].trim();
        } else {
            // Fallback: use entire filename as title, "Unknown" as author
            title = nameWithoutExt.replace(/[-_]/g, ' ');
            author = 'Unknown';
        }
        
        return {
            title: title,
            author: author,
            filename: filename,
            path: `/artwork/${category}/${filename}`,
            category: category,
            fileSize: stats.size,
            lastModified: stats.mtime.toISOString(),
            date: stats.mtime.toISOString()
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

// Initialize scanner
const scanner = new FileScanner();

// API Routes

// Get comic data
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

// Get story data
app.get('/api/stories', async (req, res) => {
    try {
        // Check if we need to rescan (every 7 days or if no data)
        const now = Date.now();
        if (!storyData || !lastScanTime || (now - lastScanTime) > AUTO_REFRESH_INTERVAL) {
            console.log('Auto-refreshing story data...');
            storyData = await scanner.scanStories();
        }
        
        res.json({ success: true, data: storyData });
    } catch (error) {
        console.error('Error getting story data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get artwork data
app.get('/api/artwork', async (req, res) => {
    try {
        // Check if we need to rescan (every 7 days or if no data)
        const now = Date.now();
        if (!artworkData || !lastScanTime || (now - lastScanTime) > AUTO_REFRESH_INTERVAL) {
            console.log('Auto-refreshing artwork data...');
            artworkData = await scanner.scanArtwork();
        }
        
        res.json({ success: true, data: artworkData });
    } catch (error) {
        console.error('Error getting artwork data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Force rescan comics
app.post('/api/comics/scan', async (req, res) => {
    try {
        comicData = await scanner.scanComics();
        lastScanTime = Date.now();
        res.json({ success: true, data: comicData });
    } catch (error) {
        console.error('Error scanning comics:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Force rescan stories
app.post('/api/stories/scan', async (req, res) => {
    try {
        storyData = await scanner.scanStories();
        res.json({ success: true, data: storyData });
    } catch (error) {
        console.error('Error scanning stories:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Force rescan artwork
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
    const filePath = path.join(__dirname, 'comics', series, filename);
    res.sendFile(filePath);
});

// Serve artwork images
app.get('/artwork/:category/:filename', (req, res) => {
    const { category, filename } = req.params;
    const filePath = path.join(__dirname, 'artwork', category, filename);
    res.sendFile(filePath);
});

// Serve story files
app.get('/stories/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'literature', filename);
    res.sendFile(filePath);
});

// Serve thumbnails
app.get('/thumbnails/:series/:filename', (req, res) => {
    const { series, filename } = req.params;
    const filePath = path.join(__dirname, 'thumbnails', series, filename);
    res.sendFile(filePath);
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle all other routes by serving index.html (for client-side routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Export for Vercel
module.exports = app;

// Start server (only in development)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🎭 The Chronicles of Max server running on http://localhost:${PORT}`);
        console.log(`📚 Comics will be served from: ${scanner.comicsPath}`);
        console.log(`📖 Stories will be served from: ${scanner.storiesPath}`);
        console.log(`🖼️  Thumbnails will be generated in: ${scanner.thumbnailsPath}`);
        
        // Initial scan
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
    });
} else {
    // In production (Vercel), initialize data immediately
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
}
