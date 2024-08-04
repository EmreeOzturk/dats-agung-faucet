"use server";

import { ethers } from "ethers";
import fs from "fs";
import { Mutex } from "async-mutex";

// Replace with your Ethereum node URL
const provider = new ethers.JsonRpcProvider(
  "https://rpcpc1-qa.agung.peaq.network"
);

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(PRIVATE_KEY!, provider);

// in tmp/claims.json
const CLAIMS_FILE = "/tmp/claims.json";

const mutex = new Mutex();
function loadClaims() {
  if (fs.existsSync(CLAIMS_FILE)) {
    return JSON.parse(fs.readFileSync(CLAIMS_FILE, "utf-8"));
  }
  return {};
}

function saveClaims(claims: Record<string, number>) {
  fs.writeFileSync(CLAIMS_FILE, JSON.stringify(claims));
}

async function hasClaimed(address: string) {
  const claims = loadClaims();
  const lastClaimed = claims[address];
  if (!lastClaimed) {
    return false;
  }
  const now = Math.floor(Date.now() / 1000);
  return now - lastClaimed < 12 * 60 * 60;
}

async function recordClaim(address: string) {
  const claims = loadClaims();
  claims[address] = Math.floor(Date.now() / 1000);
  saveClaims(claims);
}

async function sendTransaction(toAddress: string) {
  const release = await mutex.acquire();
  try {
    const hasClaimedRecently = await hasClaimed(toAddress);
    if (hasClaimedRecently) {
      throw new Error("Address has already claimed in the last 12 hours.");
    }
    const tx = {
      to: toAddress,
      value: ethers.parseEther("0.1"),
      gasLimit: 21000,
    };

    const transaction = await wallet.sendTransaction(tx);
    console.log(`Transaction sent with hash: ${transaction.hash}`);
    const receipt = await transaction.wait();
    console.log(
      `Transaction successful with hash: ${receipt?.hash} and block number: ${receipt?.blockNumber}`
    );
    await recordClaim(toAddress);
  } catch (error: any) {
    console.error(`Transaction failed: ${error?.message}`);
    throw error;
  } finally {
    release();
  }
}
export type ResponseType = { success: boolean; message?: string };

export async function claimTokens(
  previousResponse: ResponseType,
  formData: FormData
): Promise<ResponseType> {
  const address = formData.get("address") as string;
  if (!address) {
    console.error("No address provided.");
    return { message: "No address provided.", success: false };
  }
  // address validation
  if (!ethers.isAddress(address)) {
    console.error("Invalid address provided.");
    return { message: "Invalid address provided.", success: false };
  }
  console.log(`Claiming tokens for address: ${address}`);
  try {
    await sendTransaction(address);
    return { success: true, message: "Tokens claimed successfully." };
  } catch (error: any) {
    return { message: error.message, success: false };
  }
}
