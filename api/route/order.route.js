const express = require('express');
const orderController = require('../controller/order.controller.js');

const router = express.Router()

router.post('/add', orderController.addOrder);


export default router
