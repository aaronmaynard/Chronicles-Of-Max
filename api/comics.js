const fs = require('fs').promises;
const path = require('path');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const comicsPath = path.join(process.cwd(), 'comics');
        const series = [];
        
        try {
            const seriesDirs = await fs.readdir(comicsPath, { withFileTypes: true });
            
            for (const seriesDir of seriesDirs) {
                if (seriesDir.isDirectory()) {
                    const seriesName = seriesDir.name;
                    const seriesPath = path.join(comicsPath, seriesName);
                    const comics = [];
                    
                    try {
                        const files = await fs.readdir(seriesPath);
                        const imageFiles = files.filter(file => {
                            const ext = path.extname(file).toLowerCase();
                            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
                        });
                        
                        for (const file of imageFiles) {
                            const filePath = path.join(seriesPath, file);
                            const stats = await fs.stat(filePath);
                            
                            // Extract episode number and title from filename
                            // Handle both "E01 - Title" and "01 - Title" formats
                            const match = file.match(/^(?:E)?(\d+)\s*-\s*(.+?)\./);
                            const number = match ? parseInt(match[1]) : 0;
                            const title = match ? match[2] : path.parse(file).name;
                            
                            // Use GitHub raw URLs for comic images
                            const githubPath = `https://raw.githubusercontent.com/aaronmaynard/Chronicles-Of-Max/main/comics/${encodeURIComponent(seriesName)}/${encodeURIComponent(file)}`;
                            
                            comics.push({
                                number: number,
                                title: title,
                                filename: file,
                                path: githubPath,
                                thumbnail: githubPath, // Use the actual comic image as thumbnail
                                extension: path.extname(file),
                                fileSize: stats.size,
                                lastModified: stats.mtime.toISOString(),
                                series: seriesName
                            });
                        }
                        
                        comics.sort((a, b) => a.number - b.number);
                        
                        if (comics.length > 0) {
                            series.push({
                                name: seriesName,
                                path: `comics/${seriesName}/`,
                                totalComics: comics.length,
                                lastUpdated: new Date().toISOString(),
                                comics: comics
                            });
                        }
                    } catch (error) {
                        console.error(`Error scanning series ${seriesName}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Error reading comics directory:', error);
        }
        
        res.json({
            success: true,
            data: {
                lastUpdated: new Date().toISOString(),
                series: series
            }
        });
    } catch (error) {
        console.error('Error in comics API:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
