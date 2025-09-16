#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

console.log('🎭 Setting up The Chronicles of Max website...\n');

async function createDirectories() {
    const directories = [
        'comics',
        'comics/Series 1',
        'comics/Series 2', 
        'comics/Series 3',
        'stories',
        'thumbnails'
    ];

    for (const dir of directories) {
        try {
            await fs.mkdir(dir, { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
        } catch (error) {
            if (error.code !== 'EEXIST') {
                console.error(`❌ Error creating ${dir}:`, error.message);
            } else {
                console.log(`📁 Directory already exists: ${dir}`);
            }
        }
    }
}

async function createSampleFiles() {
    // Create sample comic placeholder
    const sampleComicPath = path.join('comics', 'Series 1', '01 - The Coffee Incident.txt');
    const sampleComicContent = `This is a placeholder for "The Coffee Incident" comic.
    
To add your actual comic:
1. Replace this file with your comic image (JPG, PNG, GIF, WebP, or SVG)
2. Keep the filename format: "01 - Comic Title.ext"
3. The server will automatically detect and display it

Supported formats: .jpg, .jpeg, .png, .gif, .webp, .svg`;

    try {
        await fs.writeFile(sampleComicPath, sampleComicContent);
        console.log('📝 Created sample comic placeholder');
    } catch (error) {
        console.error('❌ Error creating sample comic:', error.message);
    }

    // Create sample story
    const sampleStoryPath = path.join('stories', 'the-great-fire-of-london.txt');
    const sampleStoryContent = `The Great Fire of London
By Max the Demon Cat

For most, the Great Fire of London was a tragedy. For me, it was Tuesday.

I had been living in the city for about 600 years by then, and honestly, the place was getting a bit stale. The humans were so predictable - always rebuilding the same buildings, making the same mistakes. I needed some excitement.

So when that baker on Pudding Lane left his oven on overnight, I may have... encouraged the flames a bit. Just a little demonic nudge here and there. Nothing major.

The fire spread faster than anyone expected, consuming 13,200 houses, 87 parish churches, and the old St. Paul's Cathedral. The humans were devastated, but I was having the time of my life watching them scurry around like ants.

Of course, I didn't start the fire. That would be irresponsible. I just... made it more interesting. The humans needed a lesson in fire safety anyway.

The rebuilding took years, and I got to watch the city transform. New buildings, new opportunities for chaos. It was quite educational, really.

And before you ask - no, I don't feel guilty. The humans learned valuable lessons about fire prevention, and I got some excellent entertainment. Everyone wins.

Except for the baker. He definitely lost. But that's what you get for leaving your oven on.

- Max, Demon Cat and Unofficial Fire Safety Inspector`;

    try {
        await fs.writeFile(sampleStoryPath, sampleStoryContent);
        console.log('📖 Created sample story');
    } catch (error) {
        console.error('❌ Error creating sample story:', error.message);
    }
}

async function main() {
    try {
        await createDirectories();
        console.log('');
        await createSampleFiles();
        
        console.log('\n🎉 Setup complete!');
        console.log('\nNext steps:');
        console.log('1. Install dependencies: npm install');
        console.log('2. Start the server: npm start');
        console.log('3. Open your browser to: http://localhost:3000');
        console.log('\nTo add your comics:');
        console.log('- Place image files in the comics/Series X/ folders');
        console.log('- Use the naming format: "01 - Comic Title.ext"');
        console.log('- The server will automatically detect and display them');
        console.log('\nTo add stories:');
        console.log('- Place text files in the stories/ folder');
        console.log('- The server will automatically detect and display them');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

main();
