const Item = require("../data/item");
const User = require("../data/user");
const { hashString } = require("../utils/helpers");

const validateUploads = async (payload) => {
  const outputData = [];
  let isValid = true;
  const batchID = hashString(payload.filePath);

  /* Perform data validation here */
  // get the item
  const uploadItem = await Item.findItem(payload.itemCode);
  const requiredFields = uploadItem.uploadRequiredFields;

  // get the PFAs
  const pfas = await User.getAllPfas();
  const pfaCodes = pfas.map((pfa) => pfa.pfaCode);

  // lopp through the data
  payload.data.forEach((row) => {
    let valHolder = {
      itemCode: payload.itemCode,
      month: payload.month,
      year: payload.year,
      companyCode: payload.companyCode,
      agentId: payload.agentId,
      uploadBatchId: batchID,
    };
    let errorMsg = "";

    // make sure all required fields are present
    for (const key in requiredFields) {
      if (!Object.hasOwnProperty.call(row, key)) {
        errorMsg += `${key} is missing. `;
        isValid = false;
        continue;
      }
    }

    // make sure no extra fields are present
    for (const key in row) {
      let val = row[key];
      if (!Object.hasOwnProperty.call(requiredFields, key)) {
        errorMsg += `${key} is not allowed. `;
        isValid = false;
        continue;
      }

      // make sure data exists
      if (
        !requiredFields[key].optional &&
        (!val || (typeof val === "string" && !val.trim().length))
      ) {
        errorMsg += `${key} is a mandatory field. `;
        isValid = false;
        continue;
      }

      // validate data types
      if (requiredFields[key].type == "number") {
        val = Number(val);
        if (val && Number.isNaN(val)) {
          errorMsg += `${key} is should be a number. `;
          isValid = false;
          continue;
        }
      } else if (
        requiredFields[key].slug == "pfaCode" &&
        pfaCodes.indexOf(`${val}`) < 0
      ) {
        console.log(val, typeof val);
        // if the PFA is invalid
        errorMsg += `${key} is invalid `;
        isValid = false;
        continue;
      }

      // TODO: API validate otther columns

      valHolder[requiredFields[key].slug] = val;

      row["STATUS"] = errorMsg;
    }
    outputData.push(valHolder);
  });

  return {
    outputData,
    isValid,
  };
};
module.exports = { validateUploads };
