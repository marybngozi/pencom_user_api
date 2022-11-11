const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const documentSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
    },
    tokenVerified: {
      type: String,
      default: 0,
      required: true,
    },
    agentId: {
      type: String,
      required: true,
    },
    companyCode: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    expiryTime: {
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
  CompanyValidationToken: mongoose.model(
    "CompanyValidationToken",
    documentSchema
  ),
};
