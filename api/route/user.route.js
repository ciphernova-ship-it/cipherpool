const express = require('express');
const userController = require('../controller/user.controller.js');

const router = express.Router()

router.get('/:userAddress/orders', userController.getOrders);

module.exports = router
