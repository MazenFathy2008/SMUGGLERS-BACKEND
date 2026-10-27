import mongoose from "mongoose";
const { Schema, model } = mongoose;
const OrdersSchema = new Schema(
  {
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
      id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      roomNumber: {
        type: Number,
        required: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      note: {
        type: String,
        trim: true,
        default: "",
        maxlength: [500, "Collector note cannot exceed 500 characters"],
      },
    },

    participants: [
      {
        id: {
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

        note: {
          type: String,
          trim: true,
          default: "",
          maxlength: [300, "Participant note cannot exceed 300 characters"],
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
      enum: ["open", "closed", "completed", "cancelled"],
      default: "open",
    },
  },
  {
    timestamps: true,
  },
);

const Orders = model("Orders", OrdersSchema);

export default Orders;
