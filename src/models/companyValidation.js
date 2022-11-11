const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const documentSchema = new Schema(
  {
    apiResponse: {
      type: String,
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
    doneStatus: {
      type: Number,
      required: true,
      default: 0,
      // 0 - done but not verified, 1 - verified
    },
    verificationEmail: {
      type: String,
    },
    verificationPhone: {
      type: String,
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
  CompanyValidation: mongoose.model("CompanyValidation", documentSchema),
};
