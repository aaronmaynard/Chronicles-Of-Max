const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');

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
                        try {
                            // Parse PDF content
                            const pdfBuffer = await fs.readFile(filePath);
                            const pdfData = await pdfParse(pdfBuffer);
                            const content = pdfData.text;
                            const lines = content.split('\n').map(line => line.trim()).filter(line => line);
                            
                            // Check if this is Google Docs format (starts with "Chronicles of Max")
                            if (lines.length >= 4 && lines[0] === 'Chronicles of Max' && lines[1] === 'A Short Story') {
                                // Extract author from line 2: "Author: {Author Name}" or "AUTHOR: {Author Name}"
                                if (lines[2].toLowerCase().startsWith('author: ')) {
                                    author = lines[2].substring(lines[2].indexOf(': ') + 2);
                                }
                                
                                // Find the actual story title (first heading after the header)
                                let storyStartIndex = 4;
                                for (let i = 4; i < lines.length; i++) {
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
                                // Fallback for non-Google Docs format PDFs
                                const nameWithoutExt = path.parse(file).name;
                                title = nameWithoutExt.replace(/[-_]/g, ' ');
                                description = lines.slice(0, 3).join(' ').substring(0, 200) + '...';
                            }
                        } catch (error) {
                            console.error(`Error parsing PDF ${file}:`, error);
                            // Fallback to filename-based parsing
                            const nameWithoutExt = path.parse(file).name;
                            title = nameWithoutExt.replace(/[-_]/g, ' ');
                            description = `PDF story: ${title}`;
                        }
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
                    
                    // For PDFs, use GitHub raw URL; for others, use relative path
                    const filePath = fileExtension === '.pdf' 
                        ? `https://raw.githubusercontent.com/aaronmaynard/Chronicles-Of-Max/main/literature/${file}`
                        : `/stories/${file}`;
                    
                    stories.push({
                        title: title,
                        author: author,
                        filename: file,
                        path: filePath,
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
