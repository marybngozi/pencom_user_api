const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const documentSchema = new Schema(
  {
    agentId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionType: {
      type: Number,
      required: true,
      default: -1,
      /* 
    -1 for setup
    0 for debit
    1 for credit
    */
    },
    walletCode: {
      type: String,
      required: true,
    },
    invoiceNo: {
      type: String,
      required: true,
      default: 0,
    },
    amountBefore: {
      type: Number,
      required: true,
    },
    amountAfter: {
      type: Number,
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
      required: true,
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
  WalletHistory: mongoose.model("WalletHistory", documentSchema),
};
