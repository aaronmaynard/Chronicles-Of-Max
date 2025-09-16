// The Chronicles of Max - Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    // Initialize comic data loading
    loadComicData();
    
    // Initialize story data loading
    loadStoryData();
    
    // Initialize artwork
    initializeArtwork();
    
    // Navigation functionality
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinkElements = document.querySelectorAll('.nav-link');

    // Mobile navigation toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    navLinkElements.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');

                // Update active nav link
                navLinkElements.forEach(navLink => navLink.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Update active nav link on scroll
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const headerHeight = document.querySelector('.header').offsetHeight;
        const scrollPosition = window.scrollY + headerHeight + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinkElements.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // Max character interaction
    const maxCharacter = document.querySelector('.max-character');
    if (maxCharacter) {
        maxCharacter.addEventListener('click', function() {
            // Add a special animation when Max is clicked
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = 'float 3s ease-in-out infinite';
            }, 100);

            // Show a random Max quote
            showMaxQuote();
        });
    }

    // Comic card interactions
    const comicCards = document.querySelectorAll('.comic-card');
    comicCards.forEach(card => {
        card.addEventListener('click', function() {
            // Add a subtle animation
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);

            // Show comic details (placeholder for future functionality)
            const title = this.querySelector('h4').textContent;
            showComicModal(title);
        });
    });

    // Archive item interactions
    const archiveItems = document.querySelectorAll('.archive-item');
    archiveItems.forEach(item => {
        item.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent;
            showArchiveModal(title);
        });
    });

    // Add some random Max mischief
    addRandomMischief();

    // Initialize particle effects
    createParticleEffect();
    
    // Initialize artwork tabs
    initializeArtworkTabs();
});

// Comic Data Management
let comicData = null;
let currentSeries = null;
let storyData = null;

// Load comic data from Node.js API
async function loadComicData() {
    try {
        console.log('Loading comic data from API...');
        const response = await fetch('/api/comics');
        const result = await response.json();
        
        console.log('Comic API response:', result);
        
        if (result.success) {
            comicData = result.data;
            console.log('Loaded comic data:', comicData);
            populateSeriesTabs();
            updateLatestComic();
        } else {
            console.log('API returned success: false, using sample data');
            loadSampleComicData();
        }
    } catch (error) {
        console.error('Error loading comic data:', error);
        console.log('Using sample comic data - make sure the Node.js server is running');
        loadSampleComicData();
    }
}

// Load sample comic data when PHP scanner is not available
function loadSampleComicData() {
    comicData = {
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
                        path: 'comics/Series 1/01 - The Coffee Incident.jpg',
                        thumbnail: 'comics/Series 1/thumbnails/01 - The Coffee Incident_thumb.jpg',
                        extension: 'jpg',
                        fileSize: 1024000,
                        lastModified: new Date().toISOString(),
                        series: 'Series 1'
                    },
                    {
                        number: 2,
                        title: '3 AM Serenade',
                        filename: '02 - 3 AM Serenade.png',
                        path: 'comics/Series 1/02 - 3 AM Serenade.png',
                        thumbnail: 'comics/Series 1/thumbnails/02 - 3 AM Serenade_thumb.png',
                        extension: 'png',
                        fileSize: 800000,
                        lastModified: new Date().toISOString(),
                        series: 'Series 1'
                    },
                    {
                        number: 3,
                        title: 'Gravity is My Friend',
                        filename: '03 - Gravity is My Friend.gif',
                        path: 'comics/Series 1/03 - Gravity is My Friend.gif',
                        thumbnail: 'comics/Series 1/thumbnails/03 - Gravity is My Friend_thumb.gif',
                        extension: 'gif',
                        fileSize: 1200000,
                        lastModified: new Date().toISOString(),
                        series: 'Series 1'
                    }
                ]
            },
            {
                name: 'Series 2',
                path: 'comics/Series 2/',
                totalComics: 2,
                lastUpdated: new Date().toISOString(),
                comics: [
                    {
                        number: 1,
                        title: 'The Great Fire of London',
                        filename: '01 - The Great Fire of London.jpg',
                        path: 'comics/Series 2/01 - The Great Fire of London.jpg',
                        thumbnail: 'comics/Series 2/thumbnails/01 - The Great Fire of London_thumb.jpg',
                        extension: 'jpg',
                        fileSize: 900000,
                        lastModified: new Date().toISOString(),
                        series: 'Series 2'
                    },
                    {
                        number: 2,
                        title: 'The Trojan Cat',
                        filename: '02 - The Trojan Cat.png',
                        path: 'comics/Series 2/02 - The Trojan Cat.png',
                        thumbnail: 'comics/Series 2/thumbnails/02 - The Trojan Cat_thumb.png',
                        extension: 'png',
                        fileSize: 1100000,
                        lastModified: new Date().toISOString(),
                        series: 'Series 2'
                    }
                ]
            }
        ]
    };
    
    populateSeriesTabs();
    if (comicData.series.length > 0) {
        loadSeries(comicData.series[0].name);
    }
}

// Function to scroll to a specific section
function scrollToSection(sectionId) {
    const targetSection = document.querySelector(`#${sectionId}`);
    if (targetSection) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Max's random quotes
const maxQuotes = [
    "I didn't break it. I... improved it.",
    "Your coffee tastes better on the floor.",
    "Sleep is for the weak. I am not weak.",
    "I have 47 souls. This makes 48.",
    "Gravity is just a suggestion I choose to ignore.",
    "Your furniture is my canvas. Chaos is my art.",
    "I'm not evil. I'm just... creatively destructive.",
    "The 4th wall? I broke that years ago.",
    "Your alarm clock is my personal symphony.",
    "I teleport where I want, when I want.",
    "Your laptop is my throne. Bow before me.",
    "I don't cause problems. I create opportunities for growth.",
    "The shadows whisper my name... Max.",
    "Your sleep schedule is merely a suggestion.",
    "I'm not a demon cat. I'm a chaos consultant."
];

// Show a random Max quote
function showMaxQuote() {
    const randomQuote = maxQuotes[Math.floor(Math.random() * maxQuotes.length)];
    
    // Create a temporary quote bubble
    const quoteBubble = document.createElement('div');
    quoteBubble.className = 'max-quote-bubble';
    quoteBubble.innerHTML = `
        <div class="quote-content">
            <p>"${randomQuote}"</p>
            <span class="quote-author">- Max</span>
        </div>
    `;
    
    // Add styles
    quoteBubble.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #ff4444, #ff8800);
        color: white;
        padding: 2rem;
        border-radius: 20px;
        box-shadow: 0 0 30px rgba(255, 68, 68, 0.5);
        z-index: 10000;
        max-width: 400px;
        text-align: center;
        animation: quoteAppear 0.5s ease-out;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#quote-animations')) {
        const style = document.createElement('style');
        style.id = 'quote-animations';
        style.textContent = `
            @keyframes quoteAppear {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            @keyframes quoteDisappear {
                0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(quoteBubble);
    
    // Remove after 3 seconds
    setTimeout(() => {
        quoteBubble.style.animation = 'quoteDisappear 0.5s ease-in';
        setTimeout(() => {
            if (quoteBubble.parentNode) {
                quoteBubble.parentNode.removeChild(quoteBubble);
            }
        }, 500);
    }, 3000);
}

// Show comic modal with full image
function showComicModal(comic) {
    const modal = document.createElement('div');
    modal.className = 'comic-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${comic.title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="comic-viewer">
                <div class="comic-image-container">
                    <img src="${comic.path}" alt="${comic.title}" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzQ0ZmY0NCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1heCdzIENvbWljPC90ZXh0Pjwvc3ZnPg=='">
                    <div class="comic-overlay">
                        <h4 class="comic-title-overlay">${comic.title}</h4>
                        <div class="comic-info-overlay">
                            <p><strong>Series:</strong> ${comic.series}</p>
                            <p><strong>Number:</strong> ${comic.number}</p>
                            <p><strong>Published:</strong> ${formatDate(comic.lastModified)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // CSS handles all the styling now
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.style.animation = 'fadeOut 0.3s ease-in';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
}

// Show archive modal
function showArchiveModal(title) {
    const modal = document.createElement('div');
    modal.className = 'archive-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>This archive section is being organized by Max's minions. Check back soon for the complete collection of chaos!</p>
                <div class="archive-preview">
                    <div class="preview-strip">
                        <div class="preview-panel">
                            <p>"Coming soon..."</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: var(--secondary-dark);
        border-radius: 20px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        border: 2px solid var(--accent-red);
        box-shadow: var(--shadow-glow);
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.style.animation = 'fadeOut 0.3s ease-in';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
}

// Add random mischief effects
function addRandomMischief() {
    // Randomly change cursor on certain elements
    const mischievousElements = document.querySelectorAll('.comic-card, .archive-item, .max-character');
    
    mischievousElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            if (Math.random() < 0.1) { // 10% chance
                document.body.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'><text y=\'24\' font-size=\'24\'>👹</text></svg>"), auto';
                
                setTimeout(() => {
                    document.body.style.cursor = '';
                }, 1000);
            }
        });
    });
    
    // Randomly add glitch effects
    setInterval(() => {
        if (Math.random() < 0.05) { // 5% chance every interval
            addGlitchEffect();
        }
    }, 10000);
}

// Add glitch effect
function addGlitchEffect() {
    const glitchElements = document.querySelectorAll('.logo, .hero-title, .section-title');
    const randomElement = glitchElements[Math.floor(Math.random() * glitchElements.length)];
    
    if (randomElement) {
        const originalText = randomElement.textContent;
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        // Create glitch effect
        let glitchText = '';
        for (let i = 0; i < originalText.length; i++) {
            if (Math.random() < 0.3) {
                glitchText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
            } else {
                glitchText += originalText[i];
            }
        }
        
        randomElement.textContent = glitchText;
        randomElement.style.color = '#ff4444';
        randomElement.style.textShadow = '2px 0 #00ff00, -2px 0 #0000ff';
        
        setTimeout(() => {
            randomElement.textContent = originalText;
            randomElement.style.color = '';
            randomElement.style.textShadow = '';
        }, 200);
    }
}

// Create particle effect
function createParticleEffect() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;
    
    document.body.appendChild(particleContainer);
    
    // Create floating particles
    for (let i = 0; i < 20; i++) {
        createParticle(particleContainer);
    }
}

// Create individual particle
function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(255, 68, 68, 0.3);
        border-radius: 50%;
        animation: floatParticle ${5 + Math.random() * 10}s linear infinite;
    `;
    
    // Random starting position
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    
    // Random animation delay
    particle.style.animationDelay = Math.random() * 5 + 's';
    
    container.appendChild(particle);
    
    // Add animation keyframes if not already added
    if (!document.querySelector('#particle-animations')) {
        const style = document.createElement('style');
        style.id = 'particle-animations';
        style.textContent = `
            @keyframes floatParticle {
                0% { transform: translateY(100vh) translateX(0); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(-100px) translateX(${Math.random() * 200 - 100}px); opacity: 0; }
            }
            @keyframes fadeIn {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }
            @keyframes fadeOut {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.code);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        activateMaxMode();
        konamiCode = [];
    }
});

// Activate special Max mode
function activateMaxMode() {
    // Add special effects
    document.body.style.animation = 'maxMode 2s ease-in-out';
    
    // Show special message
    const specialMessage = document.createElement('div');
    specialMessage.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ff4444, #ff8800, #8844ff);
            color: white;
            padding: 3rem;
            border-radius: 20px;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 0 50px rgba(255, 68, 68, 0.8);
            animation: maxModeMessage 3s ease-out;
        ">
            <h2 style="font-family: 'Creepster', cursive; font-size: 2rem; margin-bottom: 1rem;">
                MAX MODE ACTIVATED!
            </h2>
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">
                You've discovered Max's secret code!
            </p>
            <p style="font-style: italic;">
                "Finally, someone worthy of my attention. Welcome to the inner circle of chaos."
            </p>
            <p style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">
                - Max, Demon Cat Supreme
            </p>
        </div>
    `;
    
    document.body.appendChild(specialMessage);
    
    // Add special animations
    if (!document.querySelector('#max-mode-animations')) {
        const style = document.createElement('style');
        style.id = 'max-mode-animations';
        style.textContent = `
            @keyframes maxMode {
                0%, 100% { filter: hue-rotate(0deg); }
                25% { filter: hue-rotate(90deg); }
                50% { filter: hue-rotate(180deg); }
                75% { filter: hue-rotate(270deg); }
            }
            @keyframes maxModeMessage {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5) rotate(-10deg); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1) rotate(5deg); }
                100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove message after 5 seconds
    setTimeout(() => {
        if (specialMessage.parentNode) {
            specialMessage.parentNode.removeChild(specialMessage);
        }
        document.body.style.animation = '';
    }, 5000);
    
    // Add temporary chaos effects
    setTimeout(() => {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                addGlitchEffect();
            }, i * 500);
        }
    }, 1000);
}

// Load story data from Node.js API
async function loadStoryData() {
    try {
        console.log('Loading story data from API...');
        const response = await fetch('/api/stories');
        const result = await response.json();
        
        console.log('Story API response:', result);
        
        if (result.success) {
            storyData = result.data;
            console.log('Loaded story data:', storyData);
            populateStoriesGrid();
        } else {
            console.log('API returned success: false for stories');
        }
    } catch (error) {
        console.error('Error loading story data:', error);
        console.log('Using sample story data - make sure the Node.js server is running');
    }
}

// Populate stories grid with dynamic data
function populateStoriesGrid() {
    const storiesGrid = document.querySelector('.stories-grid');
    console.log('Populating stories grid, storiesGrid element:', storiesGrid);
    console.log('Story data:', storyData);
    
    if (!storiesGrid || !storyData) {
        console.log('Missing storiesGrid element or storyData');
        return;
    }
    
    storiesGrid.innerHTML = '';
    console.log('Found', storyData.stories.length, 'stories to display');
    
    storyData.stories.forEach(story => {
        console.log('Creating card for story:', story.title);
        const storyCard = document.createElement('div');
        storyCard.className = 'story-card';
        
        // Extract icon based on story title
        const icon = getStoryIcon(story.title);
        const date = formatStoryDate(story.date);
        
        storyCard.innerHTML = `
            <div class="story-preview">
                <div class="story-icon">${icon}</div>
            </div>
            <h3>"${story.title}"</h3>
            <p>${story.description}</p>
            <span class="story-date">${date}</span>
        `;
        
        storyCard.addEventListener('click', () => {
            showStoryModal(story);
        });
        
        storiesGrid.appendChild(storyCard);
    });
}

// Get appropriate icon for story
function getStoryIcon(title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('fire')) return '🔥';
    if (titleLower.includes('trojan') || titleLower.includes('war')) return '⚔️';
    if (titleLower.includes('castle') || titleLower.includes('medieval')) return '🏰';
    if (titleLower.includes('space') || titleLower.includes('nasa')) return '🚀';
    if (titleLower.includes('coffee') || titleLower.includes('modern')) return '☕';
    return '📜';
}

// Format story date
function formatStoryDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    
    // If it's a historical date (before 1900), just show the year
    if (year < 1900) {
        return `${year} AD`;
    }
    
    // For modern dates, show full date
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Show story modal
function showStoryModal(story) {
    const modal = document.createElement('div');
    modal.className = 'story-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>"${story.title}"</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="story-content">
                    <p class="story-description">${story.description}</p>
                    <div class="story-actions">
                        <button class="read-story-btn" onclick="window.open('${story.path}', '_blank')">
                            Read Full Story
                        </button>
                    </div>
                </div>
                <div class="story-info">
                    <p><strong>Author:</strong> ${story.author || 'Unknown'}</p>
                    <p><strong>Published:</strong> ${formatStoryDate(story.date)}</p>
                    <p><strong>File Size:</strong> ${formatFileSize(story.fileSize)}</p>
                </div>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: var(--secondary-dark);
        border-radius: 20px;
        padding: 2rem;
        max-width: 600px;
        width: 90%;
        border: 2px solid var(--accent-red);
        box-shadow: var(--shadow-glow);
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.style.animation = 'fadeOut 0.3s ease-in';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Populate series tabs
function populateSeriesTabs() {
    const seriesTabs = document.getElementById('series-tabs');
    console.log('Populating series tabs, seriesTabs element:', seriesTabs);
    console.log('Comic data:', comicData);
    
    if (!seriesTabs || !comicData) {
        console.log('Missing seriesTabs element or comicData');
        return;
    }
    
    seriesTabs.innerHTML = '';
    console.log('Found', comicData.series.length, 'series to display');
    
    comicData.series.forEach((series, index) => {
        console.log('Creating tab for series:', series.name, 'with', series.totalComics, 'comics');
        const tab = document.createElement('button');
        tab.className = 'series-tab';
        if (index === 0) tab.classList.add('active');
        
        tab.innerHTML = `
            <span class="series-name">${series.name}</span>
            <span class="series-count">${series.totalComics} comics</span>
        `;
        
        tab.addEventListener('click', () => {
            loadSeries(series.name);
            
            // Update active tab
            document.querySelectorAll('.series-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
        
        seriesTabs.appendChild(tab);
    });
}

// Update latest comic (highest series and episode)
function updateLatestComic() {
    if (!comicData || comicData.series.length === 0) return;
    
    // Find the latest comic (highest series number, highest episode number)
    let latestComic = null;
    let latestSeries = null;
    
    for (const series of comicData.series) {
        if (series.comics.length > 0) {
            // Get the highest episode number in this series
            const highestEpisode = series.comics.reduce((latest, current) => 
                current.number > latest.number ? current : latest
            );
            
            // Extract series number from series name (e.g., "S01 - The Wizard & Me" -> 1)
            const seriesNumber = parseInt(series.name.match(/S(\d+)/)?.[1] || '0');
            const latestSeriesNumber = latestSeries ? parseInt(latestSeries.name.match(/S(\d+)/)?.[1] || '0') : 0;
            
            if (!latestComic || 
                seriesNumber > latestSeriesNumber || 
                (seriesNumber === latestSeriesNumber && highestEpisode.number > latestComic.number)) {
                latestComic = highestEpisode;
                latestSeries = series;
            }
        }
    }
    
    if (latestComic) {
        updateFeaturedComic(latestComic);
    }
}

// Load a specific series
function loadSeries(seriesName) {
    if (!comicData) return;
    
    const series = comicData.series.find(s => s.name === seriesName);
    if (!series) return;
    
    currentSeries = series;
    populateComicGrid(series);
    
    // Update episodes title
    const episodesTitle = document.getElementById('episodes-title');
    if (episodesTitle) {
        episodesTitle.textContent = `${series.name} - Episodes`;
    }
}

// Populate comic grid
function populateComicGrid(series) {
    const comicGrid = document.getElementById('comic-grid');
    if (!comicGrid) return;
    
    comicGrid.innerHTML = '';
    
    series.comics.forEach(comic => {
        const comicCard = document.createElement('div');
        comicCard.className = 'comic-card';
        
        comicCard.innerHTML = `
            <div class="comic-preview">
                <img src="${comic.thumbnail}" alt="${comic.title}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="comic-placeholder" style="display: none;">
                    <div class="scene ${getRandomScene()}">
                        <div class="furniture ${getRandomFurniture()}"></div>
                        <div class="max-character-small">
                            <div class="cat-body-small"></div>
                            <div class="cat-head-small"></div>
                            <div class="cat-ears-small"></div>
                            <div class="cat-horns-small"></div>
                            <div class="cat-eyes-small"></div>
                            <div class="cat-tail-small"></div>
                        </div>
                    </div>
                </div>
            </div>
            <h4>${comic.title}</h4>
            <p>Comic #${comic.number} from ${series.name}</p>
            <span class="comic-date">${formatDate(comic.lastModified)}</span>
        `;
        
        comicCard.addEventListener('click', () => {
            showComicModal(comic);
        });
        
        comicGrid.appendChild(comicCard);
    });
}

// Update featured comic
function updateFeaturedComic(comic) {
    const featuredComic = document.getElementById('featured-comic');
    if (!featuredComic || !comic) return;
    
    const comicTitle = featuredComic.querySelector('.comic-title');
    const comicDate = featuredComic.querySelector('.comic-date');
    const comicDescription = featuredComic.querySelector('.comic-description');
    const comicImage = featuredComic.querySelector('.comic-image');
    
    if (comicTitle) comicTitle.textContent = `"${comic.title}"`;
    if (comicDate) comicDate.textContent = `Published: ${formatDate(comic.lastModified)}`;
    if (comicDescription) {
        comicDescription.textContent = `Comic #${comic.number} from ${comic.series}. ${getRandomDescription()}`;
    }
    
    // Update the comic image
    if (comicImage) {
        comicImage.innerHTML = `
            <img src="${comic.path}" alt="${comic.title}" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzQ0ZmY0NCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1heCdzIENvbWljPC90ZXh0Pjwvc3ZnPg=='"
                 style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;">
        `;
    }
}

// Initialize artwork tabs
function initializeArtworkTabs() {
    const artworkTabs = document.querySelectorAll('.artwork-tab');
    const artworkPanels = document.querySelectorAll('.artwork-panel');
    
    artworkTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Update active tab
            artworkTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active panel
            artworkPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetTab + '-art') {
                    panel.classList.add('active');
                }
            });
        });
    });
    
    // Submit art button
    const submitArtBtn = document.querySelector('.submit-art-btn');
    if (submitArtBtn) {
        submitArtBtn.addEventListener('click', () => {
            showSubmitArtModal();
        });
    }
}

// Show submit art modal
function showSubmitArtModal() {
    const modal = document.createElement('div');
    modal.className = 'submit-art-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Submit Your Max Artwork</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>We'd love to see your Max artwork! Please submit your creations through one of these methods:</p>
                <div class="submit-methods">
                    <div class="submit-method">
                        <h4>📧 Email</h4>
                        <p>Send your artwork to: <strong>max@chroniclesofmax.com</strong></p>
                    </div>
                    <div class="submit-method">
                        <h4>🐦 Twitter</h4>
                        <p>Tag us: <strong>@ChroniclesOfMax</strong> with #MaxArt</p>
                    </div>
                    <div class="submit-method">
                        <h4>📸 Instagram</h4>
                        <p>Use hashtag: <strong>#ChroniclesOfMax</strong></p>
                    </div>
                </div>
                <div class="submission-guidelines">
                    <h4>Submission Guidelines:</h4>
                    <ul>
                        <li>Artwork should feature Max or characters from the series</li>
                        <li>High quality images preferred (PNG, JPG, or GIF)</li>
                        <li>Include your name/handle for credit</li>
                        <li>Keep it family-friendly</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: var(--secondary-dark);
        border-radius: 20px;
        padding: 2rem;
        max-width: 600px;
        width: 90%;
        border: 2px solid var(--accent-red);
        box-shadow: var(--shadow-glow);
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.style.animation = 'fadeOut 0.3s ease-in';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
}

// Helper functions
function getRandomScene() {
    const scenes = ['living-room', 'bedroom', 'kitchen', 'office'];
    return scenes[Math.floor(Math.random() * scenes.length)];
}

function getRandomFurniture() {
    const furniture = ['couch', 'lamp', 'bed', 'counter', 'desk'];
    return furniture[Math.floor(Math.random() * furniture.length)];
}

function getRandomDescription() {
    const descriptions = [
        'Max demonstrates his mastery of chaos in this latest adventure.',
        'Another day, another opportunity for Max to cause supernatural mischief.',
        'Watch as Max turns the ordinary into the extraordinary... and destructive.',
        'Max\'s unique perspective on everyday situations.',
        'Chaos ensues as Max works his demonic magic.'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Refresh content function for footer link
async function refreshContent() {
    try {
        // Refresh comics, stories, and artwork data
        const [comicsResponse, storiesResponse, artworkResponse] = await Promise.all([
            fetch('/api/comics/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
            fetch('/api/stories/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
            fetch('/api/artwork/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
        ]);

        if (comicsResponse.ok && storiesResponse.ok && artworkResponse.ok) {
            const comicsResult = await comicsResponse.json();
            const storiesResult = await storiesResponse.json();
            const artworkResult = await artworkResponse.json();
            
            console.log('Content refreshed:', { comics: comicsResult, stories: storiesResult, artwork: artworkResult });

            // Reload the page to show updated content
            window.location.reload();
        } else {
            console.error('Failed to refresh content');
        }
    } catch (error) {
        console.error('Error refreshing content:', error);
    }
}

// Local Artwork Functions
let artworkData = null;

async function loadArtworkData() {
    try {
        const response = await fetch('/api/artwork');
        const data = await response.json();
        
        if (data.success) {
            console.log('Artwork data loaded:', data);
            artworkData = data.data;
            return data.data;
        } else {
            console.error('Failed to load artwork data:', data.message);
            return null;
        }
    } catch (error) {
        console.error('Error loading artwork data:', error);
        return null;
    }
}

function populateArtworkGrid(artworkItems, gridId) {
    console.log(`Populating artwork grid: ${gridId} with ${artworkItems ? artworkItems.length : 0} items`);
    const grid = document.getElementById(gridId);
    if (!grid) {
        console.error(`Grid element not found: ${gridId}`);
        return;
    }

    // Clear existing content
    grid.innerHTML = '';

    if (artworkItems && artworkItems.length > 0) {
        console.log(`Adding ${artworkItems.length} artwork items to ${gridId}`);
        // Populate with actual artwork
        artworkItems.forEach(artwork => {
            const artworkItem = createArtworkItem(artwork);
            grid.appendChild(artworkItem);
        });
    } else {
        console.log(`No artwork items found for ${gridId}, showing placeholder`);
        // Show placeholder message
        const placeholder = document.createElement('div');
        placeholder.className = 'artwork-placeholder';
        placeholder.innerHTML = `
            <div class="placeholder-content">
                <div class="artwork-logo">🎨</div>
                <h3>No artwork found yet!</h3>
                <p>Add images to the <strong>artwork/${gridId === 'official-artwork-grid' ? 'official' : 'fanart'}</strong> folder to see them here.</p>
            </div>
        `;
        grid.appendChild(placeholder);
    }
}

function createArtworkItem(artwork) {
    const item = document.createElement('div');
    item.className = 'artwork-item';
    item.innerHTML = `
        <div class="artwork-preview" onclick="showArtworkModal('${artwork.path}', '${artwork.title.replace(/'/g, "\\'")}', '${artwork.author.replace(/'/g, "\\'")}', '${artwork.lastModified}')">
            <img src="${artwork.path}" alt="${artwork.title}" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2U0ODQxMSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFydHdvcms8L3RleHQ+PC9zdmc+'">
        </div>
        <h4>${artwork.title}</h4>
        <p class="artwork-author">By: ${artwork.author}</p>
        <p class="artwork-date">${formatDate(artwork.lastModified)}</p>
    `;
    return item;
}

// Show artwork modal
function showArtworkModal(imagePath, title, author, date) {
    const modal = document.createElement('div');
    modal.className = 'artwork-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="artwork-viewer">
                <div class="artwork-image-container">
                    <img src="${imagePath}" alt="${title}"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2U0ODQxMSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFydHdvcms8L3RleHQ+PC9zdmc+'">
                    <div class="artwork-overlay">
                        <h4 class="artwork-title-overlay">${title}</h4>
                        <div class="artwork-info-overlay">
                            <p><strong>Author:</strong> ${author}</p>
                            <p><strong>Published:</strong> ${formatDate(date)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.style.animation = 'fadeOut 0.3s ease-in';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
}

// Initialize artwork when artwork section is loaded
async function initializeArtwork() {
    console.log('Initializing artwork...');
    const data = await loadArtworkData();
    console.log('Artwork data received:', data);
    if (data && data.artwork) {
        console.log('Official artwork:', data.artwork.official);
        console.log('Fan art:', data.artwork.fanart);
        populateArtworkGrid(data.artwork.official, 'official-artwork-grid');
        populateArtworkGrid(data.artwork.fanart, 'fanart-grid');
    } else {
        console.log('No artwork data received or invalid structure');
    }
}
