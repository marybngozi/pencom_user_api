const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const documentSchema = new Schema(
  {
    itemName: {
      type: String,
      unique: true,
      required: false,
    },
    itemSlug: {
      type: String,
      unique: true,
      required: false,
    },
    itemCode: {
      type: String,
      unique: true,
      required: true,
    },
    excelSamplePath: {
      type: String,
      required: true,
    },
    excelPfaCodes: {
      type: String,
      required: true,
    },
    requiredFields: [String],
    clientRequiredFields: [String],
    uploadRequiredFields: Object,
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

module.exports = { Item: mongoose.model("Item", documentSchema) };
