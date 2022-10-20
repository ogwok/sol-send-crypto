const hre = require("hardhat");

// Returns the Ether balance of a given address.
async function getBalance(address) {
  const balanceBigInt = await hre.waffle.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses.
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

// Logs the memos stored on-chain from transactions.
async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(
      `At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`
    );
  }
}

async function main() {
  // Get the example accounts we'll be working with.
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  // We get the contract to deploy.
  const SendCrypto = await hre.ethers.getContractFactory("SendCrypto");
  const sendCrypto = await SendCrypto.deploy();

  // Deploy the contract.
  await sendCrypto.deployed();
  console.log("SendCrypto deployed to:", sendCrypto.address);

  // Check balances before the transactions.
  const addresses = [owner.address, tipper.address, sendCrypto.address];
  console.log("== start ==");
  await printBalances(addresses);

  // Buy the owner a few transactions.
  const tip = { value: hre.ethers.utils.parseEther("1") };
  await sendCrypto
    .connect(tipper)
    .sendCrypto("Carolina", "You're the best!", tip);
  await buysendCrypto
    .connect(tipper2)
    .sendCrypto("Vitto", "Amazing teacher", tip);
  await buysendCrypto
    .connect(tipper3)
    .sendCrypto("Kay", "I love my Proof of Knowledge", tip);

  // Check balances after the transactions.
  console.log("== completed transactions ==");
  await printBalances(addresses);

  // Withdraw.
  await sendCrypto.connect(owner).withdrawCrypto();

  // Check balances after withdrawal.
  console.log("== withdrawTips ==");
  await printBalances(addresses);

  // Check out the memos.
  console.log("== memos ==");
  const memos = await sendCrypto.getMemos();
  printMemos(memos);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
