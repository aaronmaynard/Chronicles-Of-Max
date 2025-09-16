const fs = require('fs').promises;
const path = require('path');

// Function to parse HTML content using specific CSS classes
function parseHTMLContent(htmlContent) {
    // Extract author from <p class="c6 subtitle"> with <span> tags
    const authorMatch = htmlContent.match(/<p class="c6 subtitle"[^>]*>.*?<span[^>]*>Author<\/span>.*?<span[^>]*>([^<]*):?<\/span>/s);
    const author = authorMatch ? authorMatch[1].replace(/:\s*$/, '').trim() : 'Unknown';
    
    // Extract title from <h1 class="c2"> with <span> tag
    const titleMatch = htmlContent.match(/<h1 class="c2"[^>]*>.*?<span[^>]*>([^<]*)<\/span>/s);
    const title = titleMatch ? titleMatch[1].trim() : 'Unknown Title';
    
    // Extract story content after the <h1> tag
    const h1EndIndex = htmlContent.indexOf('</h1>');
    if (h1EndIndex !== -1) {
        const contentAfterH1 = htmlContent.substring(h1EndIndex + 5);
        // Find the first <p> tag after the h1
        const pMatch = contentAfterH1.match(/<p[^>]*>([^<]*(?:<[^>]*>[^<]*)*?)<\/p>/s);
        if (pMatch) {
            // Clean the content by removing HTML tags
            let cleanContent = pMatch[1]
                .replace(/<[^>]*>/g, ' ') // Remove HTML tags
                .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
                .replace(/&amp;/g, '&') // Replace HTML entities
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();
            
            return { author, title, content: cleanContent };
        }
    }
    
    // Fallback if parsing fails
    return { author: 'Unknown', title: 'Unknown Title', content: '' };
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
                    const parsed = parseHTMLContent(htmlContent);
                    
                    title = parsed.title;
                    author = parsed.author;
                    description = parsed.content.substring(0, 200);
                    if (parsed.content.length > 200) {
                        description += '...';
                    }
                    
                    console.log('Parsed HTML - Title:', title, 'Author:', author, 'Description length:', description.length);
                    
                    // For HTML files, use GitHub download URL
                    const storyUrl = `https://github.com/aaronmaynard/Chronicles-Of-Max/raw/main/literature/${file}`;
                    
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
