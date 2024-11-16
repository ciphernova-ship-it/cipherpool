const _ = require("lodash");
const {LitNetwork} = require("@lit-protocol/constants");
const LitJsSdk = require("@lit-protocol/lit-node-client");
const {
    LitAbility,
    LitAccessControlConditionResource,
    LitActionResource,
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
        const wallet = walletLib.getAndMaybeInitialiseWallet();
        const litNodeClient = await getLitNodeClient();
        const sessionSigs = await litNodeClient.getSessionSigs({
            chain: "ethereum",
            // expiration: ,
            capabilityAuthSigs: [], // Unnecessary on datil-dev
            resourceAbilityRequests: [
                {
                    resource: new LitAccessControlConditionResource("*"),
                    ability: LitAbility.AccessControlConditionDecryption,
                },
                {
                    resource: new LitActionResource("*"),
                    ability: LitAbility.LitActionExecution,
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
    executeLitAction: executeLitAction
}

