import express from 'express';
const router = express.Router();

router.get('/campaigns', (req, res) => {
    res.send('Campaigns');
});

export default router;
