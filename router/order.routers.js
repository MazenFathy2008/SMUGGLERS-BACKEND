import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  joinGroupOrder,
  updateMyOrder,
  cancelMyOrder,
  getMyOrders,
  getOrderById,
} from "../controllers/orders.controlls.js";

const orderRouter = express.Router();

// جميع مسارات الأوردرات تتطلب تسجيل الدخول
orderRouter.use(protect);

// عرض كل الأوردرات التي شارك فيها المستخدم
orderRouter.get("/my-orders", getMyOrders);

// جلب تفاصيل أوردر معين
orderRouter.get("/:orderId", getOrderById);

// إرسال أوردر للراجل الأساسي (الانضمام لأوردر مجمع برقم الـ ID)
orderRouter.post("/:orderId/join", joinGroupOrder);

// تعديل أوردر المشترك
orderRouter.put("/:orderId/my-order", updateMyOrder);

// إلغاء أوردر المشترك نهائياً وخروجه من الأوردر المجمع
orderRouter.delete("/:orderId/my-order", cancelMyOrder);

export default orderRouter;
