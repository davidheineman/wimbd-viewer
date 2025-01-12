const express = require('express');
const cors = require('cors');
const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../browser')));

const client = new Client({
    cloud: {
        id: process.env.ELASTIC_CLOUD_ID,
    },
    auth: {
        apiKey: process.env.ELASTIC_API_KEY,
    },
});

app.get('/search', async (req, res) => {
    try {
        const { q, index = 're_pile' } = req.query;
        const result = await client.search({
            index,
            body: {
                query: {
                    match_phrase: {
                        text: q
                    }
                }
            }
        });
        res.json(result.hits.hits);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/counts', async (req, res) => {
    try {
        const { q, index = 're_pile' } = req.query;
        const result = await client.count({
            index,
            body: {
                query: {
                    match_phrase: {
                        text: q
                    }
                }
            }
        });
        res.json({ count: result.count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../browser/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✨✨ Server is running! Visit http://localhost:${PORT}`);
});