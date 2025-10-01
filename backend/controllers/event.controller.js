import Event from '../models/event.js';
import EventHubScraper from '../scrapers/eventScraper.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};
    
    if (type) {
      filter.type = type;
    }
    
    const events = await Event.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const { name, type, source } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ message: 'Event name and type are required' });
    }
    
    const event = new Event({
      name,
      type,
      source: source || 'VIT_EVENTS'
    });
    
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Event already exists' });
    }
    res.status(500).json({ message: 'Failed to create event' });
  }
};

// VIT EventHub scraper using our new scraper
export const scrapeVITEvents = async (req, res) => {
  try {
    console.log('🚀 Starting VIT EventHub scraping...');
    
    const scraper = new EventHubScraper();
    const scrapedEvents = await scraper.scrapeEvents();
    
    if (scrapedEvents.length === 0) {
      return res.json({
        message: 'No events found to scrape',
        saved: 0,
        total: 0
      });
    }
    
    let saved = 0;
    let duplicates = 0;
    
    // Process each scraped event
    for (const eventData of scrapedEvents) {
      try {
        console.log(`🔄 Processing: "${eventData.title}" (${eventData.category || 'general'})`);
        
        // Transform scraped data to match our simplified Event model
        const newEvent = new Event({
          name: eventData.title,
          type: eventData.category || 'general',
          source: 'VIT_EVENTHUB'
        });
        
        await newEvent.save();
        saved++;
        console.log(`✅ Saved: ${eventData.title.substring(0, 40)}...`);
        
      } catch (error) {
        if (error.code === 11000) {
          duplicates++; // Duplicate event - already exists
          console.log(`🔄 Duplicate: ${eventData.title.substring(0, 40)}...`);
          console.log(`   Index key: name="${eventData.title}", source="VIT_EVENTHUB"`);
        } else {
          console.error(`❌ Error processing event "${eventData.title}":`, error.message);
          console.error(`   Full error:`, error);
        }
      }
    }
    
    const response = {
      message: 'VIT EventHub scraping completed successfully',
      saved,
      duplicates,
      total: scrapedEvents.length
    };
    
    console.log('🎉 Scraping summary:', response);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error scraping VIT EventHub:', error);
    res.status(500).json({ 
      message: 'Failed to scrape events',
      error: error.message 
    });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updates = req.body;
    
    const event = await Event.findByIdAndUpdate(eventId, updates, { new: true });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event' });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findByIdAndDelete(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
};