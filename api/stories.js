const fs = require('fs').promises;
const path = require('path');

// Function to clean HTML content by removing tags and extracting text
function cleanHTMLContent(htmlContent) {
    // Remove HTML tags and extract clean text
    let cleanText = htmlContent
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
        .replace(/&amp;/g, '&') // Replace HTML entities
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    
    return cleanText;
}

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
                return ext === '.html';
            });

            for (const file of textFiles) {
                try {
                    const filePath = path.join(storiesPath, file);
                    const stats = await fs.stat(filePath);
                    const fileExtension = path.extname(file).toLowerCase();
                    
                    let title = path.parse(file).name.replace(/[-_]/g, ' ');
                    let author = 'Unknown';
                    let description = '';
                    
                    // Handle HTML files
                    console.log(`Processing HTML file: ${file}`);
                    const htmlContent = await fs.readFile(filePath, 'utf8');
                    const cleanContent = cleanHTMLContent(htmlContent);
                    const lines = cleanContent.split('\n').map(line => line.trim()).filter(line => line);
                    console.log('HTML lines:', lines.slice(0, 10));
                    
                    // Check if this is Google Docs format (starts with "Chronicles of Max")
                    if (lines.length >= 4 && lines[0] === 'Chronicles of Max' && lines[1] === 'A Short Story') {
                        console.log('Found Google Docs format in HTML');
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
                        // Fallback for non-Google Docs format HTML files
                        console.log('HTML file not in Google Docs format, using fallback');
                        const nameWithoutExt = path.parse(file).name;
                        title = nameWithoutExt.replace(/[-_]/g, ' ');
                        description = lines.slice(0, 3).join(' ').substring(0, 200) + '...';
                        console.log('HTML fallback - title:', title, 'description:', description);
                    }
                    
                    // For HTML files, use GitHub raw URL
                    const storyUrl = `https://raw.githubusercontent.com/aaronmaynard/Chronicles-Of-Max/main/literature/${file}`;
                    
                    stories.push({
                        title: title,
                        author: author,
                        filename: file,
                        path: storyUrl,
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
