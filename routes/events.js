const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const User = require("../models/user");

//creating event
router.post('/', async (req, res) => {
    const { title, description, date, time, location, maxParticipants } = req.body;

    try {
        const event = new Event({
            title,
            description,
            date,
            time,
            location,
            maxParticipants,
            confirmedParticipants: [],
            pendingParticipants: [],
        });

        const savedEvent = await event.save();
        res.status(201).json({message: 'Event Created successfully', event: savedEvent });
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', error });
    }
});

// Joining an event
router.post('/join/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const { name, email } = req.body;  // Accept user details

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        //if user is already confirmed or in waitlist
        const isAlreadyJoined = event.confirmedParticipants.some(p => p.email === email) ||
                                event.waitlistParticipants.some(p => p.email === email);
        if (isAlreadyJoined) {
            return res.status(400).json({ message: 'User already joined' });
        }

        // Add to confirmedParticipants or waitlistParticipants
        if (event.confirmedParticipants.length < event.maxParticipants) {
            event.confirmedParticipants.push({ name, email });
        } else {
            event.waitlistParticipants.push({ name, email });
        }

        await event.save();
        res.status(200).json({ message: 'User joined event successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error joining event', error: error.message });
    }
});


//view participants
router.get('/:eventId/participants', async (req, res) => {
    const { eventId } = req.params;
    try {
        const event = await Event.findById(eventId).populate('confirmedParticipants waitlistParticipants');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({
            confirmedParticipants: event.confirmedParticipants,
            waitlistParticipants: event.waitlistParticipants
        });
    } catch (error) {
        res.status(500).json({ message: 'Error getting participants', error });
    }
});


// Cancel participation
router.post('/cancel/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const { userId } = req.body; // Accept user ID

    try {
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        //if the user ID exists in confirmedParticipants
        const confirmedIndex = event.confirmedParticipants.findIndex(participant => participant._id.toString() === userId);
        if (confirmedIndex !== -1) {
            // Remove the user from confirmedParticipants
            event.confirmedParticipants.splice(confirmedIndex, 1);
            await event.save();
            return res.status(200).json({ message: 'User participation cancelled successfully' });
        }

        // Optionally check the waitlistParticipants if needed
        const waitlistIndex = event.waitlistParticipants.findIndex(participant => participant._id.toString() === userId);
        if (waitlistIndex !== -1) {
            // Remove the user from waitlistParticipants if needed
            event.waitlistParticipants.splice(waitlistIndex, 1);
            await event.save();
            return res.status(200).json({ message: 'User participation cancelled from waitlist successfully' });
        }

        return res.status(404).json({ message: 'User is not participating in this event' });
    } catch (error) {
        console.error('Error details:', error); // Log the error details
        res.status(500).json({ message: 'Error cancelling participation', error });
    }
});

module.exports = router;