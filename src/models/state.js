const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const documentSchema = new Schema(
  {
    stateName: {
      type: String,
      unique: true,
      required: false,
    },
    stateCode: {
      type: String,
      unique: true,
      required: false,
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

module.exports = { State: mongoose.model("State", documentSchema) };
