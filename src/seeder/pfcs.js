const PfcUsers = [
  {
    _id: "637626f124d3b8360533f363",
    companyName: "UBA Pensions Custodian Limited",
    password: "12qw!@QW",
    email: "marybngozi@gmail.com",
    userType: 400,
    phone: "09038605095",
    address: "Wuse 2",
    city: "Abuja",
    state: "FCT",
    companyRc: "3236444788",
    accountVerified: true,
    emailVerified: true,
  },
  {
    _id: "6376280a24d3b8360533f366",
    companyName: "First Pension Custodian Limited",
    password: "12qw!@QW",
    email: "marybngozi+5431@gmail.com",
    userType: 400,
    phone: "09038615195",
    address: "Wuse 2",
    city: "Abuja",
    state: "FCT",
    companyRc: "32364221722",
    accountVerified: true,
    emailVerified: true,
  },
  {
    _id: "6376278724d3b8360533f364",
    companyName: "Zenith Pensions Custodian Limited",
    password: "12qw!@QW",
    email: "marybngozi+123@gmail.com",
    userType: 400,
    phone: "09038605195",
    address: "Wuse 2",
    city: "Abuja",
    state: "FCT",
    companyRc: "32364222788",
    accountVerified: true,
    emailVerified: true,
  },
];

const Pfcs = [
  {
    _id: "63650e0efcf27d12b5441df2",
    pfcName: "UBA Pensions Custodian Limited",
    userId: "637626f124d3b8360533f363",
  },
  {
    _id: "63650f1dfcf27d12b5441df3",
    pfcName: "Zenith Pensions Custodian Limited",
    userId: "6376278724d3b8360533f364",
  },
  {
    _id: "636cb7126d321279bd156fd4",
    pfcName: "First Pension Custodian Limited",
    userId: "6376280a24d3b8360533f366",
  },
];

module.exports = { Pfcs, PfcUsers };
