const seeder = require("mongoose-seed");
const config = require("../config");
const States = require("./states");
const Pfcs = require("./pfcs");
const Pfas = require("./pfas");
const Items = require("./items");
const { MainMenus, SubMenus } = require("./menus");

// update this
const data = [
  // {
  //   model: "Pfc",
  //   documents: Pfcs,
  // },
  // {
  //   model: "State",
  //   documents: States,
  // },
  // {
  //   model: "Pfa",
  //   documents: Pfas,
  // },
  // {
  //   model: "Item",
  //   documents: Items,
  // },
  {
    model: "MainMenu",
    documents: MainMenus,
  },
  {
    model: "SubMenu",
    documents: SubMenus,
  },
];

// Connect to MongoDB via Mongoose
seeder.connect(config.MONGODB_URI, () => {
  // Load Mongoose models
  seeder.loadModels([
    // "./src/models/pfc.js",
    // "./src/models/state.js",
    // "./src/models/pfa.js",
    // "./src/models/item.js",
    "./src/models/mainMenu.js",
    "./src/models/subMenu.js",
  ]);

  // Clear specified collections
  seeder.clearModels(
    ["MainMenu", "SubMenu"],
    // ["Pfc", "State", "Pfa", "Item", "MainMenu", "SubMenu"],
    () => {
      // Callback to populate DB once collections have been cleared
      seeder.populateModels(data, () => {
        seeder.disconnect();
      });
    }
  );
});
