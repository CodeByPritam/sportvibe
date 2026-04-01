import express from 'express';
import Reel from '../models/Reel.js';

// Make Instance
const router = express.Router();

// Type of Sports
const SPORTS = [
    { key:'football', label:'Football', emoji:'⚽' },
    { key:'basketball', label:'Basketball', emoji:'🏀' },
    { key:'tennis', label:'Tennis', emoji:'🎾' },
    { key:'cricket', label:'Cricket', emoji:'🏏' },
    { key:'formula1', label:'Formula 1', emoji:'🏎️' },
    { key:'boxing', label:'Boxing', emoji:'🥊' },
    { key:'swimming', label:'Swimming', emoji:'🏊' },
    { key:'athletics', label:'Athletics', emoji:'🏃' },
];

// Get Sport
router.get('/', async (req, res, next) => {
    try {
        const counts = await Reel.aggregate([
            { $match:{ isPublished:true } }, 
            { $group:{ _id:'$sport', count:{ $sum:1 } } }
        ]);

        // Map counts to sports
        const countMap = {};
        counts.forEach(c => { countMap[c._id] = c.count; });

        // Response
        res.json({ 
            success: true, 
            data: { 
                sports: SPORTS.map(s => ({ ...s, reelsCount: countMap[s.key] || 0 })) 
            } 
        });

    } catch (err) { next(err); }
});

// Export
export default router;