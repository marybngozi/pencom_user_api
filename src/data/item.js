const { Item } = require("../models/item");
const { State } = require("../models/state");

const findAllItems = async () => {
  return await Item.find({ deleted: false }, { createdAt: 0, updatedAt: 0 });
};

const findItem = async (itemCode) => {
  return await Item.findOne(
    { deleted: false, itemCode },
    { createdAt: 0, updatedAt: 0 }
  );
};

const getAllStates = async () => {
  return await State.find(
    { deleted: false },
    { deleted: 0, createdAt: 0, updatedAt: 0 }
  );
};

module.exports = {
  findAllItems,
  findItem,
  getAllStates,
};
