const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const documentSchema = new Schema(
  {
    transmitted: {
      type: Boolean,
      default: false,
      required: true,
    },
    batchId: {
      type: String,
      required: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      /* user._id of the company agent */
    },
    companyCode: {
      type: String,
      required: true,
    },
    itemCode: {
      type: String,
      required: true,
    },
    pfcId: {
      type: Schema.Types.ObjectId,
      ref: "Pfc",
      required: true,
    },
    pfaCode: {
      type: String,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: "UploadSchedule",
      required: true,
    },
    paymentType: {
      type: String,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
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
  PfcContribution: mongoose.model("PfcContribution", documentSchema),
};
