const path = require("path");
const filePath = path.join(__dirname, "../public/schedule_sample/");

const Items = [
  {
    requiredFields: [
      "month",
      "year",
      "rsaPin",
      "firstName",
      "lastName",
      "employeeNormalContribution",
      "employerNormalContribution",
      "pfaCode",
      "amount",
    ],
    clientRequiredFields: ["tin", "phone"],
    uploadRequiredFields: {
      "STAFF ID": { slug: "staffId", type: "string", optional: true },
      "TOTAL AMOUNT": { slug: "amount", type: "number", optional: false },
      "NORMAL CONTRIBUTION BY EMPLOYEE": {
        slug: "employeeNormalContribution",
        type: "number",
        optional: false,
      },
      "VOLUNTARY CONTRIBUTION BY EMPLOYEE": {
        slug: "employeeVoluntaryContribution",
        type: "number",
        optional: true,
      },
      "NORMAL CONTRIBUTION BY EMPLOYER": {
        slug: "employerNormalContribution",
        type: "number",
        optional: false,
      },
      "VOLUNTTARY CONTRIBUTION BY EMPLOYER": {
        slug: "employerVoluntaryContribution",
        type: "number",
        optional: true,
      },
      "EMPLOYEE FIRSTNAME": {
        slug: "firstName",
        type: "string",
        optional: false,
      },
      "EMPLOYEE LASTNAME": {
        slug: "lastName",
        type: "string",
        optional: false,
      },
      "PFA CODE": { slug: "pfaCode", type: "string", optional: false },
      "RSA PIN": { slug: "rsaPin", type: "string", optional: false },
    },
    excelSamplePath: filePath + "schedule_template.xlsx",
    excelPfaCodes: filePath + "pfa_codes.xlsx",
    itemCode: "7000",
    itemName: "Pension Contributions",
    itemSlug: "contributions",
  },
];

module.exports = Items;
