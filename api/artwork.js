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
        const artworkPath = path.join(process.cwd(), 'artwork');
        const artwork = {
            official: [],
            fanart: []
        };
        
        // Scan official artwork
        const officialPath = path.join(artworkPath, 'official');
        try {
            const officialFiles = await fs.readdir(officialPath);
            const imageFiles = officialFiles.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
            });
            
            for (const file of imageFiles) {
                try {
                    const filePath = path.join(officialPath, file);
                    const stats = await fs.stat(filePath);
                    
                    // Parse filename: "TITLE - AUTHOR.ext"
                    const nameWithoutExt = path.parse(file).name;
                    const parts = nameWithoutExt.split(' - ');
                    const title = parts[0] || nameWithoutExt;
                    const author = parts[1] || 'Unknown';
                    
                    artwork.official.push({
                        title: title,
                        author: author,
                        filename: file,
                        path: `/artwork/official/${file}`,
                        fileSize: stats.size,
                        lastModified: stats.mtime.toISOString(),
                        date: stats.mtime.toISOString(),
                        category: 'official'
                    });
                } catch (error) {
                    console.error(`Error parsing official artwork file ${file}:`, error);
                }
            }
        } catch (error) {
            console.log('No official artwork folder found');
        }
        
        // Scan fan art
        const fanartPath = path.join(artworkPath, 'fanart');
        try {
            const fanartFiles = await fs.readdir(fanartPath);
            const imageFiles = fanartFiles.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
            });
            
            for (const file of imageFiles) {
                try {
                    const filePath = path.join(fanartPath, file);
                    const stats = await fs.stat(filePath);
                    
                    // Parse filename: "TITLE - AUTHOR.ext"
                    const nameWithoutExt = path.parse(file).name;
                    const parts = nameWithoutExt.split(' - ');
                    const title = parts[0] || nameWithoutExt;
                    const author = parts[1] || 'Unknown';
                    
                    artwork.fanart.push({
                        title: title,
                        author: author,
                        filename: file,
                        path: `/artwork/fanart/${file}`,
                        fileSize: stats.size,
                        lastModified: stats.mtime.toISOString(),
                        date: stats.mtime.toISOString(),
                        category: 'fanart'
                    });
                } catch (error) {
                    console.error(`Error parsing fanart file ${file}:`, error);
                }
            }
        } catch (error) {
            console.log('No fanart folder found');
        }
        
        res.json({
            success: true,
            data: {
                lastUpdated: new Date().toISOString(),
                artwork: artwork
            }
        });
    } catch (error) {
        console.error('Error in artwork API:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
