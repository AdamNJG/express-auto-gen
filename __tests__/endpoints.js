
import express from 'express';

async function handler0(req, res) {
    await res.send("this is the base route");
}
function handler1(req, res) {
    res.send("this is /test/");
}
function handler2(req, res) {
    res.send("this is /test/test");
}

const router = express.Router();

router.get('/', handler0);
router.get('/test/', handler1);
router.get('/test/test', handler2);

export default router;
    