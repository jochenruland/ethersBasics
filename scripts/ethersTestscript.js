const { ethers } = require("hardhat");

//-------------1. ethers.js basics----------------------

async function testEthers() {
    // I. Connecting to blockchain
    // 1. Provider
    console.log(ethers.version);
    console.log(await ethers.provider.connection);
    console.log(await ethers.provider.getNetwork());

    // 2. Signer
    const signer = await ethers.provider.getSigner();
    console.log(await signer.getAddress());

    // hardhat plugin -> "npx hardhat accounts" will do the following 
    const accounts = await ethers.getSigners();
    for (let a of accounts) {
        console.log(a.address);
    }

    // 3. ETH Balance
    const balance = await ethers.provider.getBalance(accounts[0].address);
    console.log(balance);
    const ethBalance = ethers.utils.formatEther(balance);
    console.log(ethBalance);
    console.log(ethers.utils.parseEther("0.5")); // string!

    // 4. Send TX from one account to another
    const sendAddress = await signer.getAddress();
    const toAddress = accounts[1].address;

    let _nonce = await signer.getTransactionCount();
    let _gasPrice = await signer.getGasPrice();
    let _gasLimit = ethers.utils.hexlify(21000);
    let _value = ethers.utils.parseUnits('100.0');
    console.log(_value);

    let tx = {
        from: sendAddress,
        to: toAddress,
        value: _value,
        nonce: _nonce,
        gasLimit: _gasLimit,
        gasPrice: _gasPrice
    }

    signer.sendTransaction(tx);

    // console.log ether transfer
    await ethers.provider.getBalance(toAddress).then((r)=>console.log(ethers.utils.formatEther(r)));
    await ethers.provider.getBalance(sendAddress).then((r)=>console.log(ethers.utils.formatEther(r)));

    // II. Wallets
    // 1. Crate wallet from mnemonic and private key
    const mn = "myth like bonus scare over problem client lizard pioneer submit female collect";
    console.log(ethers.utils.isValidMnemonic(mn));
    const wallet = ethers.Wallet.fromMnemonic(mn);

    console.log(wallet.address);
    console.log(wallet.privateKey);
    console.log(wallet.publicKey);
    console.log(wallet.mnemonic);

}

/*
testEthers().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
*/

//----------------- 2. Logs & Events -----------------

// 1. Get logs from the blockchain
let provider;
let currentBlock;
let rawLogs;
const abi = '[{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"punkIndex","type":"uint256"}],"name":"PunkTransfer","type":"event"}]';

function getProvider() {
    provider = ethers.getDefaultProvider('homestead'); // connect to the mainnet
}


async function getLogs() {
    console.log(`Getting the PunkTransfer events...`);

    const cryptopunkContractAddress = '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB'; 

    const provider = ethers.provider;
    const eventSignature = 'PunkTransfer(address,address,uint256)';
    const eventTopic = ethers.utils.id(eventSignature); // Get the data hex string

    rawLogs = await provider.getLogs({
        address: cryptopunkContractAddress,
        topics: [eventTopic],
        fromBlock: currentBlock - 10000, 
        toBlock: currentBlock
    });
}

async function processLogsWithInterface() {

    const intrfc = new ethers.utils.Interface(abi);

    rawLogs.forEach((log) => {
        console.log(`BEFORE PARSING:`);
        console.debug(log);
        console.log(`\n`);

        console.log(`AFTER PARSING:`);
        let parsedLog = intrfc.parseLog(log);
        console.debug(parsedLog);
        console.log('************************************************');
    })
}

async function getLogsMain() {
    await getProvider();
    currentBlock = await provider.getBlockNumber();
    await getLogs();
    await processLogsWithInterface();
}

/*
getLogsMain().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
*/

// 2. Get events from the blockchain with queryFilter
let cryptopunkContract;

async function getContract() {
    console.log(`Getting the CryptoPunk contract...`);

    const cryptopunkContractAddress = '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB';
    cryptopunkContract = new ethers.Contract(cryptopunkContractAddress, abi, provider);
}

async function getEvents() {
    console.log(`Getting the PunkTransfer events...`);
  
    let events = await cryptopunkContract.queryFilter('PunkTransfer', currentBlock - 10000, currentBlock);
  
    console.log(events);
}


async function getEventsMain() {
    await getProvider();
    currentBlock = await provider.getBlockNumber();
    await getContract();
    await getEvents();
}


getEventsMain().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
