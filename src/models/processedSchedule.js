const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const documentSchema = new Schema(
  {
    invoiceNo: {
      type: String,
      unique: true,
      required: true,
      index: { unique: true },
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: Number,
      default: 0,
      required: true,
    },
    companyCode: {
      type: String,
      required: true,
    },
    agentId: {
      type: String,
      required: true,
    },
    itemCode: {
      type: String,
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      required: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    strict: false,
    timestamps: true,
    toObject: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

module.exports = {
  ProcessedSchedule: mongoose.model("ProcessedSchedule", documentSchema),
};
