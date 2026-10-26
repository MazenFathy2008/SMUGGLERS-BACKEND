import Orders from "../model/orders.model.js";
import { io } from "../server.js";

// 1. إرسال أوردر للراجل الأساسي (الانضمام للأوردر المجمع)
export const joinGroupOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { items, deliveryFee } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "يجب اختيار صنف واحد على الأقل",
      });
    }

    const order = await Orders.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "الأوردر المجمع غير موجود",
      });
    }

    // التحقق إن الأوردر لسه مفتوح وماتقفلش
    if (order.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "الأوردر لم يعد مفتوحاً لاستقبال طلبات جديدة",
      });
    }

    // التحقق هل المستخدم مشترك بالفعل مسبقاً
    const alreadyJoined = order.participants.some(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: "لقد أرسلت طلبك بالفعل في هذا الأوردر، يمكنك تعديله بدلاً من إرسال طلب جديد",
      });
    }

    // إضافة أوردر المشترك
    const participantData = {
      user: req.user._id,
      name: req.user.name,
      phone: req.user.phone,
      items,
      deliveryFee: deliveryFee || 0,
    };

    order.participants.push(participantData);
    await order.save();

    // إشعار لايف للراجل الأساسي عبر Socket.io
    io.emit("orderUpdated", order);

    res.status(201).json({
      success: true,
      message: "تم إرسال أوردرك للراجل الأساسي بنجاح",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// 2. تعديل الأوردر من قبل صاحبه
export const updateMyOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { items, deliveryFee } = req.body;

    const order = await Orders.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "الأوردر المجمع غير موجود",
      });
    }

    // 1. التحقق إن الأوردر لسه مفتوح وماتقفلش
    if (order.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "عفواً، تم إغلاق الأوردر أو دخل مرحلة التنفيذ ولا يمكن تعديله",
      });
    }

    // 2. البحث عن أوردر هذا المستخدم داخل المشتركين
    const participant = order.participants.find(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على أوردر خاص بك في هذا الطلب المجمع",
      });
    }

    // 3. تعديل الأصناف وقيمة التوصيل
    if (items && Array.isArray(items) && items.length > 0) {
      participant.items = items;
    }
    if (deliveryFee !== undefined) {
      participant.deliveryFee = deliveryFee;
    }

    await order.save();

    // تحديث لايف للراجل الأساسي
    io.emit("orderUpdated", order);

    res.status(200).json({
      success: true,
      message: "تم تعديل أوردرك بنجاح",
      order,
      participant,
    });
  } catch (error) {
    next(error);
  }
};

// 3. إلغاء الأوردر ومسحه خالص من قبل صاحبه
export const cancelMyOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Orders.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "الأوردر المجمع غير موجود",
      });
    }

    // 1. التحقق إن الأوردر لسه مفتوح
    if (order.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "لا يمكن إلغاء الأوردر لأنه دخل مرحلة التنفيذ أو تم إغلاقه",
      });
    }

    // 2. التأكد إن المشترك موجود ومسحه
    const participantIndex = order.participants.findIndex(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (participantIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "أنت لست مشتركاً في هذا الأوردر لإلغائه",
      });
    }

    // حذف الأوردر الخاص بالمستخدم من قائمة المشتركين
    order.participants.splice(participantIndex, 1);
    await order.save();

    // إشعار الراجل الأساسي بأن المشترك ألغى أوردره
    io.emit("orderUpdated", order);

    res.status(200).json({
      success: true,
      message: "تم إلغاء أوردرك وخروجك من الطلب بنجاح",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// 4. عرض الأوردرات التي شارك فيها المستخدم
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Orders.find({
      "participants.user": req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// 5. جلب تفاصيل أوردر مجمع معين
export const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Orders.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "الأوردر غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};
