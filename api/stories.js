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
        const storiesPath = path.join(process.cwd(), 'literature');
        const stories = [];
        
        try {
            const files = await fs.readdir(storiesPath);
            const textFiles = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.txt', '.md', '.html', '.pdf'].includes(ext);
            });

            for (const file of textFiles) {
                try {
                    const filePath = path.join(storiesPath, file);
                    const stats = await fs.stat(filePath);
                    const fileExtension = path.extname(file).toLowerCase();
                    
                    let title = path.parse(file).name.replace(/[-_]/g, ' ');
                    let author = 'Unknown';
                    let description = '';
                    
                    if (fileExtension === '.pdf') {
                        // For PDFs, just use filename as title for now
                        description = `PDF file: ${file}`;
                    } else {
                        // Handle text files
                        const content = await fs.readFile(filePath, 'utf8');
                        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
                        
                        // Check if this is Google Docs format
                        if (lines.length >= 4 && lines[0] === 'Chronicles of Max' && lines[1] === 'A Short Story') {
                            // Extract author
                            if (lines[2].toLowerCase().startsWith('author: ')) {
                                author = lines[2].substring(lines[2].indexOf(': ') + 2);
                            }
                            
                            // Find story title
                            let storyStartIndex = 4;
                            for (let i = 4; i < lines.length; i++) {
                                if (lines[i] && !lines[i].startsWith('http')) {
                                    title = lines[i];
                                    storyStartIndex = i + 1;
                                    break;
                                }
                            }
                            
                            // Get description
                            const storyContent = lines.slice(storyStartIndex).join(' ');
                            description = storyContent.substring(0, 200);
                            if (storyContent.length > 200) {
                                description += '...';
                            }
                        } else {
                            description = lines.slice(0, 3).join(' ').substring(0, 200) + '...';
                        }
                    }
                    
                    stories.push({
                        title: title,
                        author: author,
                        filename: file,
                        path: `/stories/${file}`,
                        description: description,
                        fileSize: stats.size,
                        lastModified: stats.mtime.toISOString(),
                        date: stats.mtime.toISOString()
                    });
                } catch (error) {
                    console.error(`Error parsing story file ${file}:`, error);
                }
            }

            // Sort stories by date
            stories.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Error reading stories directory:', error);
        }
        
        res.json({
            success: true,
            data: {
                lastUpdated: new Date().toISOString(),
                stories: stories
            }
        });
    } catch (error) {
        console.error('Error in stories API:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
