import mongoose from "mongoose";

const { Schema, model } = mongoose;

const OrdersSchema = new Schema({
  restaurant: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
  },

  collector: {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
  },

  participants: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },

      items: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
            validate: {
              validator: Number.isInteger,
              message: "Quantity must be an integer",
            },
          },
        },
      ],
      deliveryFee: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  ],

  settings: {
    closingPolicy: {
      type: String,
      enum: ["deadline", "delivery_target", "manual"],
      default: "manual",
    },

    deadline: {
      type: Date,
      default: null,
    },

    targetDeliveryAmount: {
      type: Number,
      min: 0,
      default: null,
    },
  },

  status: {
    type: String,
    enum: ["open", "closed", "submitted", "completed", "cancelled"],
    default: "open",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Orders = model("Orders", OrdersSchema);

export default Orders;
