const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const documentSchema = new Schema(
  {
    uploadBatchId: {
      type: String,
      required: false,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyCode: {
      type: String,
      required: true,
    },
    itemCode: {
      type: String,
      required: true,
    },
    rsaPin: {
      type: String,
      required: false,
    },
    staffId: {
      type: String,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    pfaCode: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    employeeNormalContribution: {
      type: Number,
      required: true,
    },
    employerNormalContribution: {
      type: Number,
      required: true,
    },
    employeeVoluntaryContribution: {
      type: Number,
    },
    employerVoluntaryContribution: {
      type: Number,
    },
    paid: {
      type: Number,
      required: true,
      default: 0,
    },
    datePaid: {
      type: Date,
      required: false,
    },
    processedStatus: {
      type: Number,
      required: true,
      default: 0,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    uploadType: {
      type: String,
      required: true,
      default: "excel",
    },
    dateProcessed: {
      type: Date,
      required: false,
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
  UploadSchedule: mongoose.model("UploadSchedule", documentSchema),
};
