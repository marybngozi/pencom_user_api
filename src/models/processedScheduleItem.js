const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const documentSchema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      ref: "UploadSchedule",
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    invoiceNo: {
      type: String,
      required: true,
    },
    paid: {
      type: Number,
      required: true,
      default: 0,
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
    timestamps: true,
    toObject: {
      transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
      },
    },
    toJSON: {
      transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

module.exports = {
  ProcessedScheduleItem: mongoose.model(
    "ProcessedScheduleItem",
    documentSchema
  ),
};
