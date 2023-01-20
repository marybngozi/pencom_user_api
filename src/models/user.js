const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SALT_WORK_FACTOR = 10;

const { Schema } = mongoose;

const documentSchema = new Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    otherName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    userType: {
      type: Number,
      required: true,
      default: 100,
      /* 
      100 for company, 
      200 for staff, 
      300 for AdminStaff 
      400 for pfc 
      500 for pfa
      */
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    companyName: {
      type: String,
    },
    logo: {
      type: String,
    },
    companyRc: {
      type: String,
    },
    companyCode: {
      type: String,
    },
    pfaCode: {
      type: String,
    },
    rsaPin: {
      type: String,
    },
    accountVerified: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    passwordReset: {
      type: Boolean,
      default: false,
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

// for updating password
documentSchema.pre("findOneAndUpdate", async function (next) {
  // only hash the password if it has been modified
  if (this._update.password) {
    this._update.password = bcrypt.hashSync(
      this._update.password,
      SALT_WORK_FACTOR
    );
  }
  next();
});

documentSchema.pre("save", function (next) {
  // only hash the password if it has been modified (or is new)
  if (this.isModified("password")) {
    // hash user password and save
    this.password = bcrypt.hashSync(this.password, SALT_WORK_FACTOR);
  }

  next();
});

// eslint-disable-next-line func-names
documentSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};
module.exports = { User: mongoose.model("User", documentSchema) };
