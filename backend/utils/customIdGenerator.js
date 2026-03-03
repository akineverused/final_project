import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import prisma from "../src/lib/prisma.js";

export const generateCustomId = (inventory, sequenceNumber) => {
    const config = inventory.customIdConfig;

    if (!config || !Array.isArray(config)) {
        return String(sequenceNumber);
    }

    let result = "";

    for (const element of config) {
        switch (element.type) {

            case "TEXT":
                result += element.value || "";
                break;

            case "RANDOM_20BIT":
                result += crypto.randomInt(0, 2 ** 20).toString();
                break;

            case "RANDOM_32BIT":
                result += crypto.randomInt(0, 2 ** 32).toString();
                break;

            case "RANDOM_6":
                result += String(
                    crypto.randomInt(0, 1000000)
                ).padStart(6, "0");
                break;

            case "RANDOM_9":
                result += String(
                    crypto.randomInt(0, 1000000000)
                ).padStart(9, "0");
                break;

            case "GUID":
                result += uuidv4();
                break;

            case "DATE":
                result += new Date().toISOString().slice(0, 10);
                break;

            case "SEQUENCE":
                result += String(sequenceNumber);
                break;

            default:
                break;
        }
    }

    return result;
};