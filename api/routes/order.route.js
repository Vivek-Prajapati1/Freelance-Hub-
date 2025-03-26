import express from "express";
import {verifyToken} from '../middelware/jwt.js'
const router =express.Router();
import {getOrders,createOrder,confirm} from '../controller/order.controller.js'
// router.post('/:gigId',verifyToken,createOrder);
router.post('/create-payment-intent/:id',verifyToken,createOrder);
router.get('/',verifyToken,getOrders);
router.put('/',verifyToken,confirm);


export default router;





