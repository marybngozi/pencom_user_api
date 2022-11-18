const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const documentSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    path: {
      type: String,
      required: true,
      unique: true,
    },
    menuId: {
      type: Schema.Types.ObjectId,
      ref: "MainMenu",
      required: true,
    },
    menuType: {
      type: String,
      enum: ["company", "staff", "adminStaff", "pfa"],
      default: "company",
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

module.exports = { SubMenu: mongoose.model("SubMenu", documentSchema) };
