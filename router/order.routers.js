const express = require('express');
const router = express.Router();
const {
  createOrder,
  updateOrder,
  cancelOrder,
  getMyOrders,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// كل المسارات محمية بـ protect عشان نعرف مين اليوزر اللي باعت الطلب
router.post('/', protect, createOrder);           // إنشاء أوردر: POST /api/orders
router.get('/my-orders', protect, getMyOrders);   // عرض أوردراتي: GET /api/orders/my-orders
router.put('/:id', protect, updateOrder);         // تعديل أوردر: PUT /api/orders/:id
router.delete('/:id', protect, cancelOrder);      // إلغاء أوردر: DELETE /api/orders/:id

module.exports = router;