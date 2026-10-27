import mongoose from "mongoose";
import dns from "node:dns";

import Orders from "../model/orders.model.js";
import { MONGODB_URI } from "../config/env.js";

async function insertOrder() {
  dns.setServers(["8.8.8.8"]);

  try {
    if (!MONGODB_URI) {
      throw new Error("MongoDB connection URI is missing from .env");
    }

    await mongoose.connect(MONGODB_URI);

    const order = await Orders.create({
      restaurant: {
        name: "Shakshak",
        address: "6th of October City",
      },

      collector: {
        id: new mongoose.Types.ObjectId("6ae08c5d73d2b88015bd4e09"),
        name: "Mazen Fathy Abdelbaset Mabrouk",
        roomNumber: 103,
        phone: "01157083176",
        note: "اللي عايز يطلب يكتب طلبه قبل ما ذ يتقفل.",
      },

      participants: [],

      settings: {
        closingPolicy: "manual",
        deadline: null,
        targetDeliveryAmount: null,
      },

      status: "open",
    });

    console.log("Order inserted successfully!");
    console.log("Order ID:", order._id);
    console.log(JSON.stringify(order, null, 2));
  } catch (error) {
    console.error("Failed to insert order:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

insertOrder();
