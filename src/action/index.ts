"use server";

import { ethers } from "ethers";
import fs from "fs";

// Replace with your Ethereum node URL
const provider = new ethers.JsonRpcProvider(
  "https://rpcpc1-qa.agung.peaq.network"
);

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(PRIVATE_KEY!, provider);

const CLAIMS_FILE = process.cwd() + "/claims.json";

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
  return now - lastClaimed < 24 * 60 * 60;
}

async function recordClaim(address: string) {
  const claims = loadClaims();
  claims[address] = Math.floor(Date.now() / 1000);
  saveClaims(claims);
}

async function sendTransaction(toAddress: string) {
  const hasClaimedRecently = await hasClaimed(toAddress);
  if (hasClaimedRecently) {
    console.log(
      `Address ${toAddress} has already claimed in the last 24 hours.`
    );
    return;
  }

  const tx = {
    to: toAddress,
    value: ethers.parseEther("0.1"),
    gasLimit: 21000,
  };

  try {
    const transaction = await wallet.sendTransaction(tx);
    console.log(`Transaction sent with hash: ${transaction.hash}`);
    const receipt = await transaction.wait();
    console.log(
      `Transaction successful with hash: ${receipt?.hash} and block number: ${receipt?.blockNumber}`
    );
    await recordClaim(toAddress);
  } catch (error: any) {
    console.error(`Transaction failed: ${error?.message}`);
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
  console.log(`Claiming tokens for address: ${address}`);
  try {
    // await sendTransaction(address);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return { success: true, message: "Tokens claimed successfully." };
  } catch (error: any) {
    return { message: error.message, success: false };
  }
}
