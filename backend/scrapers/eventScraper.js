import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

class EventHubScraper {
    constructor() {
        this.baseUrl = 'https://eventhubcc.vit.ac.in/EventHub/';
        this.axiosConfig = {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            },
            // Skip SSL verification for scraping
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        };
    }

    async scrapeEvents() {
        try {
            console.log('🔍 Fetching events from VIT EventHub...');
            const response = await axios.get(this.baseUrl, this.axiosConfig);
            
            console.log('✅ Page loaded successfully');
            const $ = cheerio.load(response.data);
            
            const events = [];
            
            // Look for event cards - trying multiple selectors to find the right structure
            const eventSelectors = [
                '.card',
                '.event-card',
                '.card-body',
                '[class*="card"]'
            ];
            
            let eventsFound = false;
            
            for (const selector of eventSelectors) {
                const eventElements = $(selector);
                
                if (eventElements.length > 0) {
                    console.log(`📋 Found ${eventElements.length} elements with selector: ${selector}`);
                    
                    eventElements.each((index, element) => {
                        const event = this.extractEventData($, element);
                        if (event && event.title) {
                            events.push(event);
                            eventsFound = true;
                        }
                    });
                    
                    if (eventsFound) break; // Stop once we find events
                }
            }
            
            // If no events found with card selectors, try finding event titles directly
            if (!eventsFound) {
                console.log('🔄 Trying alternative selectors for event titles...');
                
                // Look for the specific structure you mentioned
                const titleElements = $('.card-title span, h3.card-title span, .card-title, h3.card-title');
                
                console.log(`📋 Found ${titleElements.length} title elements`);
                
                titleElements.each((index, element) => {
                    const title = $(element).text().trim();
                    if (title && title.length > 5) { // Filter out empty or very short titles
                        const event = {
                            id: this.generateEventId(title),
                            title: title,
                            description: this.extractDescription($, element),
                            date: this.extractDate($, element),
                            time: this.extractTime($, element),
                            location: this.extractLocation($, element),
                            organizer: this.extractOrganizer($, element),
                            category: this.categorizeEvent(title),
                            scraped_at: new Date().toISOString(),
                            source_url: this.baseUrl
                        };
                        
                        events.push(event);
                        console.log(`✨ Extracted event: ${event.title.substring(0, 50)}...`);
                    }
                });
            }
            
            // Remove duplicates based on title
            const uniqueEvents = this.removeDuplicates(events);
            
            console.log(`🎉 Successfully scraped ${uniqueEvents.length} unique events`);
            return uniqueEvents;
            
        } catch (error) {
            console.error('❌ Error scraping events:', error.message);
            
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
            
            throw new Error(`Failed to scrape events: ${error.message}`);
        }
    }

    extractEventData($, element) {
        const $el = $(element);
        
        // Extract title from various possible locations
        const title = this.extractTitle($, element);
        
        if (!title) return null;
        
        return {
            id: this.generateEventId(title),
            title: title,
            description: this.extractDescription($, element),
            date: this.extractDate($, element),
            time: this.extractTime($, element),
            location: this.extractLocation($, element),
            organizer: this.extractOrganizer($, element),
            category: this.categorizeEvent(title),
            scraped_at: new Date().toISOString(),
            source_url: this.baseUrl
        };
    }

    extractTitle($, element) {
        const $el = $(element);
        
        // Try multiple selectors for title
        const titleSelectors = [
            '.card-title span',
            '.card-title',
            'h1, h2, h3, h4, h5, h6',
            '.title',
            '.event-title',
            '[class*="title"]'
        ];
        
        for (const selector of titleSelectors) {
            const titleEl = $el.find(selector).first();
            if (titleEl.length > 0) {
                const title = titleEl.text().trim();
                if (title && title.length > 3) {
                    return title;
                }
            }
        }
        
        // If no title found in children, check the element itself
        const directTitle = $el.text().trim();
        if (directTitle && directTitle.length > 3) {
            return directTitle.split('\n')[0].trim(); // Take first line if multiline
        }
        
        return null;
    }

    extractDescription($, element) {
        const $el = $(element);
        
        // Look for description in various places
        const descSelectors = [
            '.card-text',
            '.description',
            '.event-description',
            'p',
            '.content'
        ];
        
        for (const selector of descSelectors) {
            const desc = $el.find(selector).first().text().trim();
            if (desc && desc.length > 10) {
                return desc;
            }
        }
        
        return 'No description available';
    }

    extractDate($, element) {
        const $el = $(element);
        const text = $el.text();
        
        // Common date patterns
        const datePatterns = [
            /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
            /(\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2,4})/i,
            /((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{2,4})/i
        ];
        
        for (const pattern of datePatterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1];
            }
        }
        
        return 'Date TBD';
    }

    extractTime($, element) {
        const $el = $(element);
        const text = $el.text();
        
        // Time patterns
        const timePatterns = [
            /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i,
            /(\d{1,2}\.\d{2}\s*(?:AM|PM|am|pm))/i,
            /(\d{1,2}\s*(?:AM|PM|am|pm))/i
        ];
        
        for (const pattern of timePatterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1];
            }
        }
        
        return 'Time TBD';
    }

    extractLocation($, element) {
        const $el = $(element);
        const text = $el.text();
        
        // Common location keywords
        const locationKeywords = ['hall', 'auditorium', 'room', 'venue', 'block', 'seminar hall', 'conference', 'lab', 'classroom', 'ground', 'court'];
        
        // Clean text by removing extra whitespace and newlines
        const cleanText = text.replace(/\s+/g, ' ').trim();
        
        for (const keyword of locationKeywords) {
            const regex = new RegExp(`[^.!?]*${keyword}[^.!?]*`, 'i');
            const match = cleanText.match(regex);
            if (match) {
                let location = match[0].trim();
                // Clean up the location string
                location = location
                    .replace(/\s+/g, ' ')
                    .replace(/^[^a-zA-Z0-9]*/, '') // Remove leading non-alphanumeric
                    .replace(/[^a-zA-Z0-9]*$/, '') // Remove trailing non-alphanumeric
                    .substring(0, 100); // Limit length
                    
                if (location.length > 5) {
                    return location;
                }
            }
        }
        
        return 'VIT Chennai';
    }

    extractOrganizer($, element) {
        const $el = $(element);
        const text = $el.text();
        
        // Look for department or organizing body
        const orgPatterns = [
            /(?:organized by|by)\s+([^.,\n]+)/i,
            /(?:department of|dept\\.? of)\s+([^.,\n]+)/i,
            /(?:school of)\s+([^.,\n]+)/i
        ];
        
        for (const pattern of orgPatterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        
        return 'VIT Chennai';
    }

    categorizeEvent(title) {
        const categories = {
            'technical': ['workshop', 'seminar', 'conference', 'symposium', 'hackathon', 'coding', 'tech', 'programming', 'ai', 'ml', 'data science', 'cyber', 'robotics', 'iot', 'blockchain'],
            'cultural': ['cultural', 'fest', 'dance', 'music', 'art', 'drama', 'theatre', 'literary', 'quiz', 'debate'],
            'sports': ['sports', 'game', 'tournament', 'match', 'championship', 'athletic', 'fitness'],
            'academic': ['lecture', 'talk', 'presentation', 'research', 'paper', 'thesis', 'academic', 'education'],
            'career': ['placement', 'career', 'job', 'interview', 'internship', 'company', 'recruitment'],
            'social': ['social', 'community', 'volunteer', 'awareness', 'charity', 'ngo']
        };
        
        const titleLower = title.toLowerCase();
        
        for (const [category, keywords] of Object.entries(categories)) {
            for (const keyword of keywords) {
                if (titleLower.includes(keyword)) {
                    return category;
                }
            }
        }
        
        return 'general';
    }

    generateEventId(title) {
        return title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
    }

    removeDuplicates(events) {
        const seen = new Set();
        return events.filter(event => {
            const key = event.title.toLowerCase().trim();
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    // Method to test the scraper
    async testScrape() {
        try {
            const events = await this.scrapeEvents();
            
            console.log('\n📊 Scraping Summary:');
            console.log('====================');
            console.log(`Total events found: ${events.length}`);
            
            if (events.length > 0) {
                console.log('\n📋 Sample Events:');
                console.log('==================');
                
                events.slice(0, 3).forEach((event, index) => {
                    console.log(`\n${index + 1}. ${event.title}`);
                    console.log(`   Category: ${event.category}`);
                    console.log(`   Date: ${event.date}`);
                    console.log(`   Time: ${event.time}`);
                    console.log(`   Location: ${event.location}`);
                    console.log(`   Organizer: ${event.organizer}`);
                    console.log(`   Description: ${event.description.substring(0, 100)}...`);
                });
                
                // Group by category
                const byCategory = {};
                events.forEach(event => {
                    byCategory[event.category] = (byCategory[event.category] || 0) + 1;
                });
                
                console.log('\n📈 Events by Category:');
                console.log('======================');
                Object.entries(byCategory).forEach(([category, count]) => {
                    console.log(`${category}: ${count}`);
                });
            }
            
            return events;
        } catch (error) {
            console.error('❌ Test failed:', error.message);
            throw error;
        }
    }
}

// Export the scraper
export default EventHubScraper;

// If running this file directly, run the test
if (import.meta.url === `file://${process.argv[1]}`) {
    const scraper = new EventHubScraper();
    scraper.testScrape()
        .then(() => {
            console.log('\n✅ Scraping test completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Scraping test failed:', error.message);
            process.exit(1);
        });
}