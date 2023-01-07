const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const documentSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyCode: {
      type: String,
      required: true,
    },
    rsaPin: {
      type: String,
      required: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      /* user _id of the staff */
    },
    inviteAccepted: {
      type: Boolean,
      default: false,
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

module.exports = { AdminStaff: mongoose.model("AdminStaff", documentSchema) };
