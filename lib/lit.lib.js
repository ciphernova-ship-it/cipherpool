const _ = require("lodash");
const ethers = require("ethers");
const {LitContracts} = require("@lit-protocol/contracts-sdk");
const {LIT_RPC, LitNetwork} = require("@lit-protocol/constants");
const LitJsSdk = require("@lit-protocol/lit-node-client");
const {
    LitAbility,
    LitAccessControlConditionResource,
    LitActionResource,
    LitPKPResource,
    createSiweMessage,
    generateAuthSig,
} = require("@lit-protocol/auth-helpers");

const walletLib = require("./wallet.lib");
const loggerLib = require("./logger.lib.js");
const globalLib = require("./global.lib.js");

const litConfig = require("../config/lit.config.json");
const globalKeyEnum = require("../enum/global.key.enum.js");

async function connect() {
    try {
        const litNodeClient = new LitJsSdk.LitNodeClientNodeJs({
            litNetwork: LitNetwork.DatilDev,
            debug: false
        });
        await litNodeClient.connect();

        globalLib.setGlobalKey(globalKeyEnum.LIT_NODE_CLIENT, litNodeClient);
        loggerLib.logInfo("Lit node client connected successfully!");
    } catch (error) {
        throw error;
    }
}

async function disconnect() {
    try {
        const litNodeClient = await getLitNodeClient();
        await litNodeClient.disconnect();
    } catch (error) {
        throw error;
    }
}

function isLitNodeClientConnected() {
    try {
        return globalLib.getGlobalKey(globalKeyEnum.LIT_NODE_CLIENT) !== undefined;
    } catch (error) {
        throw error;
    }
}

function getLitNodeClient() {
    try {
        if (!isLitNodeClientConnected()) {
            throw new Error("Lit node client not connected!");
        }

        return globalLib.getGlobalKey(globalKeyEnum.LIT_NODE_CLIENT);
    } catch (error) {
        throw error;
    }
}

async function generateSessionSigs() {
    try {
        const wallet = getChainWallet();
        const litNodeClient = await getLitNodeClient();
        const sessionSigs = await litNodeClient.getSessionSigs({
            chain: "bscTestnet",
            // expiration: ,
            capabilityAuthSigs: [],
            resourceAbilityRequests: [
                {
                    resource: new LitAccessControlConditionResource("*"),
                    ability: LitAbility.AccessControlConditionDecryption,
                },
                {
                    resource: new LitActionResource("*"),
                    ability: LitAbility.LitActionExecution,
                },
                {
                    resource: new LitPKPResource("*"),
                    ability: LitAbility.PKPSigning,
                },
            ],
            authNeededCallback: async ({
                                           uri,
                                           expiration,
                                           resourceAbilityRequests,
                                       }) => {
                const toSign = await createSiweMessage({
                    uri,
                    expiration,
                    resources: resourceAbilityRequests,
                    walletAddress: wallet.address,
                    nonce: await litNodeClient.getLatestBlockhash(),
                    litNodeClient,
                });

                return await generateAuthSig({
                    signer: wallet,
                    toSign,
                });
            },
        });

        if (_.isEmpty(sessionSigs)) {
            throw new Error("Session signatures not generated!");
        }

        globalLib.setGlobalKey(globalKeyEnum.LIT_SESSION_SIGS, sessionSigs);
        loggerLib.logInfo("Session signatures generated successfully!");
    } catch (error) {
        throw error;
    }
}

function areSessionSigsGenerated() {
    return globalLib.getGlobalKey(globalKeyEnum.LIT_SESSION_SIGS) !== undefined;
}

function getSessionSigs() {
    try {
        if (!areSessionSigsGenerated()) {
            throw new Error("Session signatures not generated!");
        }

        return globalLib.getGlobalKey(globalKeyEnum.LIT_SESSION_SIGS);
    } catch (error) {
        throw error;
    }
}

function initialiseChainWallet(privateKey) {
    try {
        if (_.isEmpty(privateKey)) {
            throw new Error(`Missing args! privateKey: ${privateKey}`);
        }

        const wallet = walletLib.getWallet(privateKey, litConfig.chainRpcUrl);
        globalLib.setGlobalKey(globalKeyEnum.CHAIN_WALLET, wallet);
        loggerLib.logInfo(`Initialised chain wallet successfully! address: ${wallet.address}`);
    } catch (error) {
        throw error;
    }
}


function isChainWalletInitialised() {
    return globalLib.getGlobalKey(globalKeyEnum.CHAIN_WALLET) !== undefined;
}

function getChainWallet() {
    try {
        if (!isChainWalletInitialised()) {
            throw new Error("Chain wallet not initialised!");
        }

        return globalLib.getGlobalKey(globalKeyEnum.CHAIN_WALLET);
    } catch (error) {
        throw error;
    }
}

function getChainProvider() {
    return walletLib.getProvider(litConfig.chainRpcUrl);
}

function initialiseYellowStoneWallet(privateKey) {
    try {
        if (_.isEmpty(privateKey)) {
            throw new Error(`Missing args! privateKey: ${privateKey}`);
        }

        const wallet = walletLib.getWallet(privateKey, LIT_RPC.CHRONICLE_YELLOWSTONE);
        globalLib.setGlobalKey(globalKeyEnum.YELLOW_STONE_WALLET, wallet);
        loggerLib.logInfo(`Initialised yellowstone wallet successfully! address: ${wallet.address}`);
    } catch (error) {
        throw error;
    }
}

function isYellowStoneWalletInitialised() {
    return globalLib.getGlobalKey(globalKeyEnum.YELLOW_STONE_WALLET) !== undefined;
}

function getYellowStoneWallet() {
    try {
        if (!isYellowStoneWalletInitialised()) {
            throw new Error("Yellowstone wallet not initialised!");
        }

        return globalLib.getGlobalKey(globalKeyEnum.YELLOW_STONE_WALLET);
    } catch (error) {
        throw error;
    }
}

async function initialiseLitContracts() {
    try {
        const yellowstoneWallet = getYellowStoneWallet();
        const litContracts = new LitContracts({
            signer: yellowstoneWallet,
            network: LitNetwork.DatilDev,
        });
        await litContracts.connect();
        globalLib.setGlobalKey(globalKeyEnum.LIT_CONTRACTS, litContracts);
        loggerLib.logInfo(`Initialised lit contracts successfully!`);
    } catch (error) {
        throw error;
    }
}

function isLitContractsInitialised() {
    return globalLib.getGlobalKey(globalKeyEnum.LIT_CONTRACTS) !== undefined;
}

function getLitContracts() {
    try {
        if (!isLitContractsInitialised()) {
            throw new Error("Lit contracts not initialised!");
        }

        return globalLib.getGlobalKey(globalKeyEnum.LIT_CONTRACTS);
    } catch (error) {
        throw error;
    }
}

async function initialisePkp() {
    try {
        const litContracts = getLitContracts();
        const pkpInfo = (await litContracts.pkpNftContractUtils.write.mint()).pkp;

        globalLib.setGlobalKey(globalKeyEnum.PKP, {
            tokenId: pkpInfo.tokenId,
            publicKey: pkpInfo.publicKey,
            ethAddress: pkpInfo.ethAddress
        });
        loggerLib.logInfo(`Initialised pkp successfully!`);

        const chainWallet = getChainWallet();
        const chainProvider = getChainProvider();
        const balance = await chainProvider.getBalance(pkpInfo.ethAddress);
        const formattedBalance = ethers.utils.formatEther(balance);

        if (Number(formattedBalance) < Number(ethers.utils.formatEther(25_000))) {
            loggerLib.logInfo(`Funding pkp...`);

            const fundingTx = {
                to: pkpInfo.ethAddress,
                value: ethers.utils.parseEther("0.001"),
                gasLimit: 21_000,
                gasPrice: (await chainWallet.getGasPrice()).toHexString(),
                nonce: await chainProvider.getTransactionCount(chainWallet.address),
                chainId: litConfig.chainId
            }
            const fundingTxPromise = await chainWallet.sendTransaction(fundingTx);
            const fundingTxReceipt = await fundingTxPromise.wait();

            loggerLib.logInfo(`✅ PKP funded. Transaction hash: ${fundingTxReceipt.transactionHash}`);
        }
    } catch (error) {
        throw error;
    }
}

function isPkpInitialised() {
    return globalLib.getGlobalKey(globalKeyEnum.PKP) !== undefined;
}

function getPkp() {
    try {
        if (!isPkpInitialised()) {
            throw new Error("PKP not initialised!");
        }

        return globalLib.getGlobalKey(globalKeyEnum.PKP);
    } catch (error) {
        throw error;
    }
}

async function encrypt(str, acc) {
    try {
        if (_.isEmpty(str)) {
            throw new Error(`Missing args! str: ${str}`);
        }

        const litNodeClient = await getLitNodeClient();
        const {ciphertext, dataToEncryptHash} = await LitJsSdk.encryptString({
                accessControlConditions: acc,
                dataToEncrypt: str,
            },
            litNodeClient
        );

        return {
            ciphertext: ciphertext,
            dataToEncryptHash: dataToEncryptHash
        };
    } catch (error) {
        throw error;
    }
}

async function decrypt(ciphertext, dataToEncryptHash, acc, sessionSigs) {
    try {
        if (_.isNil(ciphertext) || _.isNil(dataToEncryptHash) || _.isNil(acc) || _.isNil(sessionSigs)) {
            throw new Error(`Missing args! ciphertext: ${ciphertext}, dataToEncryptHash: ${dataToEncryptHash} acc: ${acc}, sessionSigs: ${sessionSigs}`);
        }

        const litNodeClient = await getLitNodeClient();
        const decryptedStr = await LitJsSdk.decryptToString({
                chain: "ethereum",
                ciphertext: ciphertext,
                dataToEncryptHash: dataToEncryptHash,
                accessControlConditions: acc,
                sessionSigs: sessionSigs,
            },
            litNodeClient
        );

        return decryptedStr;
    } catch (error) {
        throw error;
    }
}

function getOrderMatchingLitActionCode() {
    return `(async () => {
    try{
  let order1 = await Lit.Actions.decryptAndCombine({
    accessControlConditions,
    ciphertext:order1Ciphertext,
    dataToEncryptHash:order1DataToEncryptHash,
    authSig: null,
    chain: 'ethereum',
  });
  order1=JSON.parse(order1);
  
  let order2= await Lit.Actions.decryptAndCombine({
    accessControlConditions,
    ciphertext: order2Ciphertext,
    dataToEncryptHash:order2DataToEncryptHash,
    authSig: null,
    chain: 'ethereum',
  });
  order2=JSON.parse(order2);
  
  if(order1.sourceTokenAmount === order2.destTokenAmount && order1.destTokenAmount === order2.sourceTokenAmount){
        Lit.Actions.setResponse({ response: "MATCHED" });
        return;
  }

   Lit.Actions.setResponse({ response: "NOT_MATCHED" });
  }catch(error){
    console.log(error);
  }
})();`
}

async function executeLitAction(litActionCid, sessionSigs, jsParams) {
    try {
        if (_.isEmpty(litActionCid) || _.isEmpty(sessionSigs) || _.isEmpty(jsParams)) {
            throw new Error(`Missing args! litActionCid: ${litActionCid}, sessionSigs: ${sessionSigs}, jsParams: ${jsParams}`);
        }

        const litNodeClient = getLitNodeClient();
        return await litNodeClient.executeJs({
            ipfsId: litActionCid,
            sessionSigs: sessionSigs,
            jsParams: jsParams,
        });
    } catch (error) {
        throw error;
    }
}

async function executeLitActionWithCode(code, sessionSigs, jsParams) {
    try {
        if (_.isEmpty(code) || _.isEmpty(sessionSigs) || _.isEmpty(jsParams)) {
            throw new Error(`Missing args! code: ${code}, sessionSigs: ${sessionSigs}, jsParams: ${jsParams}`);
        }

        const litNodeClient = getLitNodeClient();
        return await litNodeClient.executeJs({
            code: code,
            sessionSigs: sessionSigs,
            jsParams: jsParams,
        });
    } catch (error) {
        throw error;
    }
}

function getOrderEncryptionAcc(maker) {
    try {
        if (_.isEmpty(maker)) {
            throw new Error(`Missing args! maker: ${maker}`);
        }

        return [
            {
                contractAddress: '',
                standardContractType: '',
                chain: "ethereum",
                method: '',
                parameters: [
                    ':userAddress',
                ],
                returnValueTest: {
                    comparator: '=',
                    value: maker
                },
            },
            {operator: "or"},
            {
                contractAddress: '',
                standardContractType: '',
                chain: 'ethereum',
                method: '',
                parameters: [':currentActionIpfsId'],
                returnValueTest: {
                    comparator: '=',
                    value: litConfig.orderMatchingLitActionCid,
                },
            }
        ]
    } catch (error) {
        throw error
    }
}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt,
    connect: connect,
    disconnect: disconnect,
    getSessionSigs: getSessionSigs,
    generateSessionSigs: generateSessionSigs,
    getOrderEncryptionAcc: getOrderEncryptionAcc,
    getOrderMatchingLitActionCode: getOrderMatchingLitActionCode,
    executeLitAction: executeLitAction,
    initialiseChainWallet: initialiseChainWallet,
    isChainWalletInitialised: isChainWalletInitialised,
    getChainWallet: getChainWallet,
    getChainProvider: getChainProvider,
    initialiseYellowStoneWallet: initialiseYellowStoneWallet,
    isYellowStoneWalletInitialised: isYellowStoneWalletInitialised,
    getYellowStoneWallet: getYellowStoneWallet,
    initialiseLitContracts: initialiseLitContracts,
    isLitContractsInitialised: isLitContractsInitialised,
    getLitContracts: getLitContracts,
    initialisePkp: initialisePkp,
    isPkpInitialised: isPkpInitialised,
    getPkp: getPkp,
    executeLitActionWithCode:executeLitActionWithCode
}

