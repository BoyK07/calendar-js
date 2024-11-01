const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes

// GET alle evenementen
app.get('/events', (req, res) => {
    const eventsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'events.json'), 'utf8'));
    res.json(eventsData.events);
});

// POST een nieuw evenement
app.post('/events', (req, res) => {
    const eventsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'events.json'), 'utf8'));
    const newEvent = req.body;
    newEvent.id = eventsData.events.length + 1;
    eventsData.events.push(newEvent);
    fs.writeFileSync(path.resolve(__dirname, 'events.json'), JSON.stringify(eventsData, null, 2));
    res.json(newEvent);
});

// PUT bewerk een bestaand evenement
app.put('/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    const eventsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'events.json'), 'utf8'));
    const updatedEvent = req.body;
    const index = eventsData.events.findIndex(event => event.id === eventId);
    if (index !== -1) {
        eventsData.events[index] = updatedEvent;
        fs.writeFileSync(path.resolve(__dirname, 'events.json'), JSON.stringify(eventsData, null, 2));
        res.json(updatedEvent);
    } else {
        res.status(404).send('Event not found');
    }
});

// DELETE verwijder een evenement
app.delete('/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    const eventsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'events.json'), 'utf8'));
    const index = eventsData.events.findIndex(event => event.id === eventId);
    if (index !== -1) {
        eventsData.events.splice(index, 1);
        fs.writeFileSync(path.resolve(__dirname, 'events.json'), JSON.stringify(eventsData, null, 2));
        res.sendStatus(200);
    } else {
        res.status(404).send('Event not found');
    }
});

// Start de server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
