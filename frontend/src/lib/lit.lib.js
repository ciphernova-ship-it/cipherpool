import {LitNetwork} from '@lit-protocol/constants';
import {disconnectWeb3} from "@lit-protocol/auth-browser";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import {LitNodeClient} from '@lit-protocol/lit-node-client';
import {
    LitAbility,
    LitAccessControlConditionResource,
    createSiweMessage,
    generateAuthSig,
} from "@lit-protocol/auth-helpers";

import globalLib from "./global.lib.js";
import loggerLib from "../lib/logger.lib.js";

import globalKeyEnum from "../enum/global.key.enum.js";
import _ from "lodash";

async function connect() {
    try {
        const litNodeClient = new LitNodeClient({
            litNetwork: LitNetwork.DatilDev,
            debug: false
        });

        await litNodeClient.connect();
        globalLib.setGlobalKey(globalKeyEnum.LIT_NODE_CLIENT, litNodeClient);
        loggerLib.logInfo('Connected to Lit Network!');
    } catch (error) {
        throw error;
    }
}

function isLitNodeClientConnected() {
    return globalLib.getGlobalKey(globalKeyEnum.LIT_NODE_CLIENT) !== undefined;
}

function getLitNodeClient() {
    try {
        if (!isLitNodeClientConnected()) {
            throw new Error('Lit node client not connected!');
        }

        return globalLib.getGlobalKey(globalKeyEnum.LIT_NODE_CLIENT);
    } catch (error) {
        throw error;
    }
}

async function disconnect() {
    try {
        disconnectWeb3();
        const litNodeClient = await getLitNodeClient();
        await litNodeClient.disconnect();
    } catch (error) {
        throw error;
    }
}

async function generateSessionSigs(signer) {
    try {
        if (_.isEmpty(signer)) {
            throw new Error(`Missing args! signer: ${signer}`);
        }

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
                    walletAddress: signer._address,
                    nonce: await litNodeClient.getLatestBlockhash(),
                    litNodeClient,
                });

                return await generateAuthSig({
                    signer,
                    toSign,
                });
            },
        });

        if (_.isEmpty(sessionSigs)) {
            throw new Error('Failed to generate session signatures');
        }

        return sessionSigs;
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

export default {
    encrypt: encrypt,
    decrypt: decrypt,
    connect: connect,
    disconnect: disconnect,
    getLitNodeClient: getLitNodeClient,
    generateSessionSigs: generateSessionSigs,
    isLitNodeClientConnected: isLitNodeClientConnected
}