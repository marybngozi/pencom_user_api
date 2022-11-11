const axios = require("axios");
const config = require("../config");
const CompanyValidation = require("../data/companyValidation");
const { ServerError } = require("../utils/errors");

const companyValidationCall = async ({ agentId, companyCode }) => {
  // make call and create the validation
  try {
    const data = JSON.stringify({
      ID: companyCode,
    });
    /* 
    const url = "#"
    const config = {
      method: "post",
      url: url,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    const res = await axios(config);
    // console.log(JSON.stringify(res.data));

    // if it is successful
    if (res.data.status != "100") {
      return {
        validationStatus: false,
        phoneNumber: "",
        emailAddress: "",
        validationMessage: "Company validation not successfully",
      };
    }

    // remove the datatype
    const datatype = res.data.DataType;
    const re = new RegExp(datatype, "i");

    const genericDataObj = {};

    // make the key generic
    for (const key in res.data.Data) {
      if (Object.hasOwnProperty.call(res.data.Data, key)) {
        const newKey = key.replace(re, "");
        genericDataObj[newKey] = res.data.Data[key];
      }
    }

    let validationMessage = "",
      validationStatus = true;

    // if both PhoneNumber and EmailAddress are available
    if (genericDataObj.PhoneNumber && genericDataObj.EmailAddress) {
      validationMessage = `Email Address and Phone Number is available`;
    } else if (genericDataObj.PhoneNumber) {
      validationMessage = `Only Phone Number is available`;
    } else if (genericDataObj.EmailAddress) {
      validationMessage = `Only Email Address is available`;
    } else {
      validationStatus = false;
      validationMessage = `No Email Address or Phone Number related to the ID provided, visit your State ID to add email address and phone number`;
    }

    if (!validationStatus) {
      return {
        validationStatus: false,
        phoneNumber: "",
        emailAddress: "",
        validationMessage: res.data.message,
      };
    }

    // if response is successful
    await CompanyValidation.createValidation({
      apiResponse: JSON.stringify(res.data),
      agentId,
      doneStatus: 0,
      companyCode,
      vEmail: genericDataObj.EmailAddress,
      vPhone: genericDataObj.PhoneNumber,
    });

    return {
      validationStatus,
      phoneNumber: genericDataObj.PhoneNumber,
      emailAddress: genericDataObj.EmailAddress,
      validationMessage,
    }; */

    // TODO: remove mock data
    const genericDataObj = {
      EmailAddress: "umunnawill@gmail.com",
      PhoneNumber: "08136587946",
    };

    await CompanyValidation.createValidation({
      apiResponse: JSON.stringify(data),
      agentId,
      doneStatus: 0,
      companyCode,
      vEmail: genericDataObj.EmailAddress,
      vPhone: genericDataObj.PhoneNumber,
    });

    return {
      validationStatus: true,
      phone: genericDataObj.PhoneNumber,
      email: genericDataObj.EmailAddress,
      validationMessage: "Company Validation successful",
    };
  } catch (err) {
    console.log("API Error", err);
    return {
      validationStatus: false,
      phone: null,
      email: null,
      validationMessage: "State validation not successfully",
    };
  }
};

const validateRSAPin = async (rsaPin, email) => {
  let rsaMessage = "";
  let status = true;

  // TODO:
  // check if rsaPin exists

  // check if rsaPin belongs to email

  // check api if rsaPin is valid
  return { rsaMessage, status };
};

module.exports = {
  companyValidationCall,
  validateRSAPin,
};
