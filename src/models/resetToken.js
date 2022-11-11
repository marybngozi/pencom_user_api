const mongoose = require("mongoose");

const { Schema } = mongoose;

const documentSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    tokenUsed: {
      type: Boolean,
      default: false,
    },
    usedOn: {
      type: Date,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
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

module.exports = {
  ResetToken: mongoose.model("ResetToken", documentSchema),
};
