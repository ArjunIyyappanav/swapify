import Event from '../models/event.js';

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } })
      .sort({ date: 1 })
      .limit(10);
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { name, description, date, location, spots, skills, organizer } = req.body;
    
    const event = new Event({
      name,
      description,
      date: new Date(date),
      location,
      spots: spots || 50,
      skills: skills || [],
      organizer
    });
    
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const joinEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.participants.includes(userId)) {
      return res.status(400).json({ message: 'Already joined this event' });
    }
    
    if (event.participants.length >= event.spots) {
      return res.status(400).json({ message: 'Event is full' });
    }
    
    event.participants.push(userId);
    await event.save();
    
    res.status(200).json({ message: 'Successfully joined event' });
  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
