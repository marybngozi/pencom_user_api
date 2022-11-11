const { User } = require("../models/user");
const { Pfa } = require("../models/pfa");
const { Pfc } = require("../models/pfc");

const createUser = async (data) => {
  data.email = data.email.toLowerCase();

  const newUser = new User(data);
  await newUser.save();

  // delete the user password
  newUser.password = null;
  return newUser;
};

const getUserById = async (id) => {
  const user = await User.findOne(
    { _id: id, deleted: false },
    {
      password: 0,
    }
  );

  return user;
};

const getUser = async ({ email, rsaPin, companyCode }) => {
  const findObj = {
    deleted: false,
  };
  if (companyCode) {
    findObj["companyCode"] = companyCode;
  } else if (email) {
    findObj["email"] = email;
  } else if (rsaPin) {
    findObj["rsaPin"] = rsaPin;
  } else {
    return null;
  }

  const user = await User.findOne(findObj, {
    password: 0,
  });

  return user;
};

const updateDetails = async (id, data) => {
  const updateUser = await User.findOneAndUpdate({ _id: id }, data, {
    new: true,
  });

  return updateUser;
};

const updateAccountStatus = async (email) => {
  const user = await User.findOneAndUpdate(
    { email: email, accountVerified: false, deleted: false },
    {
      accountVerified: true,
      emailVerified: true,
    },
    {
      new: true,
    }
  );

  return user;
};

const updatePassword = async (email, password) => {
  const user = await User.findOneAndUpdate(
    { email: email, deleted: false },
    {
      password: password,
    },
    {
      new: true,
    }
  );

  return user;
};

const verifyPassword = async (id, password) => {
  const user = await User.findById(id);

  if (!user) return false;

  const passwordMatch = await user.comparePassword(password);

  if (!passwordMatch) return false;

  return true;
};

const getPfa = async (pfa) => {
  return await Pfa.findOne({ pfaCode: pfa, deleted: false });
};

const getAllPfas = async (option = "exclude") => {
  let pfas;
  if (option == "include") {
    pfas = await Pfa.find().populate("pfc", "pfcName");
  } else {
    pfas = await Pfa.find();
  }

  return pfas;
};

const getPfc = async (pfc) => {
  return await Pfc.findOne({ pfcCode: pfc, deleted: false });
};

const getAllPfcs = async () => {
  const pfcs = await Pfc.find();

  return pfcs;
};

module.exports = {
  createUser,
  getUserById,
  getUser,
  updateDetails,
  updateAccountStatus,
  updatePassword,
  verifyPassword,
  getAllPfas,
  getPfa,
  getAllPfcs,
  getPfc,
};
