const { Wallet } = require("../models/wallet");
const { WalletHistory } = require("../models/walletHistory");

const checkWalletCode = async (walletCode) => {
  const itExists = await Wallet.findOne(
    { deleted: false, walletCode },
    {
      updatedAt: 0,
      deletedAt: 0,
      deleted: false,
      createdAt: 0,
    }
  );

  if (itExists) return true;
  return false;
};

const generateWalletCode = async () => {
  let walletCode = Math.floor(Math.random() * 1000000000000);
  const numExists = await checkWalletCode(walletCode);
  if (numExists) {
    walletCode = generateWalletCode();
  }
  return walletCode;
};

const createWallet = async ({ companyCode, agentId }) => {
  const prevWallet = await getWallet(companyCode);

  if (prevWallet) return null;

  let walletCode = await generateWalletCode();

  const wallet = await Wallet.create({
    companyCode,
    agentId,
    walletCode,
    amount: 0,
  });

  await WalletHistory.create({
    agentId,
    transactionType: -1,
    walletCode,
    amount: 0,
    amountBefore: 0,
    amountAfter: 0,
  });

  return wallet;
};

const updateWallet = async ({
  moneyAmount,
  companyCode,
  agentId,
  transactionType,
  invoiceNo,
}) => {
  // find the wallet
  const wallet = await Wallet.findOne(
    { deleted: false, companyCode },
    {
      updatedAt: 0,
      deletedAt: 0,
      deleted: false,
      createdAt: 0,
    }
  );

  // if none was found, return false
  if (!wallet) return false;

  moneyAmount = parseFloat(moneyAmount) || 0;
  if (moneyAmount == 0) return false;

  const walletAmount =
    transactionType == 1
      ? (wallet.amount + moneyAmount).toFixed(2)
      : (wallet.amount - moneyAmount).toFixed(2);

  // Update the wallet
  await Wallet.updateOne(
    {
      walletCode: wallet.walletCode,
      companyCode,
    },
    {
      amount: walletAmount,
      updatedAt: new Date(),
    }
  );

  // log the wallet transcation to wallet history
  await WalletHistory.create({
    agentId,
    transactionType,
    invoiceNo,
    walletCode: wallet.walletCode,
    amount: moneyAmount.toFixed(2),
    amountBefore: wallet.amount.toFixed(2),
    amountAfter: walletAmount,
  });

  return walletAmount;
};

const getWallet = async (companyCode) => {
  return await Wallet.findOne(
    {
      companyCode,
      deleted: false,
    },
    {
      updatedAt: 0,
      deletedAt: 0,
      deleted: false,
    }
  );
};

const checkWalletAmount = async ({ companyCode }) => {
  const wallet = await Wallet.findOne(
    {
      companyCode,
      deleted: false,
    },
    {
      updatedAt: 0,
      deletedAt: 0,
      deleted: false,
    }
  );

  if (wallet.amount == 0) return false;
  return true;
};

const getWalletHistory = async ({ walletCode, companyCode }) => {
  return await WalletHistory.find(
    {
      deleted: false,
      walletCode,
      companyCode,
    },
    {
      updatedAt: 0,
      deletedAt: 0,
      deleted: false,
    }
  );
};

module.exports = {
  createWallet,
  updateWallet,
  getWallet,
  getWalletHistory,
  checkWalletAmount,
};
