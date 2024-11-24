"use server";

import { ethers } from "ethers";
import fs from "fs";
import { Mutex } from "async-mutex";

const provider = new ethers.JsonRpcProvider(
  "https://rpcpc1-qa.agung.peaq.network"
);

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(PRIVATE_KEY!, provider);

// in tmp/claims.json
const CLAIMS_FILE = "/tmp/claims.json";

const mutex = new Mutex();

// Add IP tracking to claims
type ClaimRecord = {
  lastClaimed: number;
  ipAddresses: Array<{
    address: string;
    timestamp: number;
  }>;
};

function loadClaims(): Record<string, ClaimRecord> {
  try {
    if (fs.existsSync(CLAIMS_FILE)) {
      const data = JSON.parse(fs.readFileSync(CLAIMS_FILE, "utf-8"));
      // Ensure each record has the correct structure
      Object.keys(data).forEach(address => {
        if (!data[address].ipAddresses) {
          data[address].ipAddresses = [];
        }
      });
      return data;
    }
  } catch (error) {
    console.error('Error loading claims:', error);
  }
  return {};
}

function saveClaims(claims: Record<string, ClaimRecord>) {
  try {
    // Ensure directory exists
    const dir = '/tmp';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Validate and fix data structure before saving
    Object.keys(claims).forEach(address => {
      if (!claims[address].ipAddresses) {
        claims[address].ipAddresses = [];
      }
    });
    
    fs.writeFileSync(CLAIMS_FILE, JSON.stringify(claims, null, 2));
  } catch (error) {
    console.error('Error saving claims:', error);
  }
}

async function hasClaimed(address: string, ip: string) {
  const claims = loadClaims();
  const claim = claims[address];
  
  const now = Math.floor(Date.now() / 1000);
  const TWELVE_HOURS = 12 * 60 * 60;

  try {
    // Check if IP has been used too many times in the last 12 hours
    const recentIpClaims = Object.values(claims)
      .filter(record => record && Array.isArray(record.ipAddresses))
      .flatMap(record => 
        record.ipAddresses.filter(ipRecord => 
          ipRecord && 
          ipRecord.address === ip && 
          (now - ipRecord.timestamp) < TWELVE_HOURS
        )
      );
    
    if (recentIpClaims.length >= 3) {
      // Generic error message that doesn't reveal IP limitation
      throw new Error("You've reached the maximum number of claims. Please try again later.");
    }

    if (!claim) return false;
    
    // Check address cooldown
    return now - claim.lastClaimed < TWELVE_HOURS;
  } catch (error) {
    console.error('Error in hasClaimed:', error);
    throw error;
  }
}

async function recordClaim(address: string, ip: string) {
  const claims = loadClaims();
  
  // Initialize if doesn't exist
  if (!claims[address]) {
    claims[address] = {
      lastClaimed: 0,
      ipAddresses: []
    };
  }
  
  // Ensure ipAddresses exists
  if (!claims[address].ipAddresses) {
    claims[address].ipAddresses = [];
  }
  
  claims[address] = {
    lastClaimed: Math.floor(Date.now() / 1000),
    ipAddresses: [
      ...claims[address].ipAddresses,
      {
        address: ip,
        timestamp: Math.floor(Date.now() / 1000)
      }
    ]
  };
  
  saveClaims(claims);
}

async function isNewContract(address: string): Promise<boolean> {
  const code = await provider.getCode(address);
  if (code !== '0x') { // It's a contract
    const txCount = await provider.getTransactionCount(address);
    return txCount < 5; // Consider it new if few transactions
  }
  return false;
}

function cleanupOldRecords() {
  const claims = loadClaims();
  const now = Math.floor(Date.now() / 1000);
  const TWELVE_HOURS = 12 * 60 * 60;

  // Clean up old IP records
  for (const address of Object.keys(claims)) {
    claims[address].ipAddresses = claims[address].ipAddresses.filter(
      ipRecord => (now - ipRecord.timestamp) < TWELVE_HOURS
    );
  }

  saveClaims(claims);
}

async function sendTransaction(toAddress: string, ip: string) {
  const release = await mutex.acquire();
  try {
    cleanupOldRecords();
    
    const hasClaimedRecently = await hasClaimed(toAddress, ip);
    if (hasClaimedRecently) {
      throw new Error("Address has already claimed in the last 12 hours.");
    }
    
    if (await isNewContract(toAddress)) {
      throw new Error("This address is not eligible for tokens at this time.");
    }
    
    const balance = await provider.getBalance(toAddress);
    const maxBalance = ethers.parseEther("1.0");
    
    if (balance > maxBalance) {
      throw new Error("Address already has sufficient tokens");
    }
    
    const tx = {
      to: toAddress,
      value: ethers.parseEther("0.2"),
      gasLimit: 21000,
    };

    const transaction = await wallet.sendTransaction(tx);
    console.log(`Transaction sent with hash: ${transaction.hash}`);
    const receipt = await transaction.wait();
    console.log(
      `Transaction successful with hash: ${receipt?.hash} and block number: ${receipt?.blockNumber}`
    );
    await recordClaim(toAddress, ip);
  } catch (error: any) {
    console.error(`Transaction failed: ${error?.message}`);
    // Log the real error for monitoring but return a generic message
    throw new Error(error.message);
  } finally {
    release();
  }
}
export type ResponseType = { success: boolean; message?: string };

export async function claimTokens(
  previousResponse: ResponseType,
  formData: FormData,
  clientIp: string
): Promise<ResponseType> {
  
  const address = formData.get("address") as string;
  if (!address) {
    return { message: "Please provide a valid address.", success: false };
  }

  if (!ethers.isAddress(address)) {
    return { message: "Please provide a valid address.", success: false };
  }

  try {
    await sendTransaction(address, clientIp);
    return { success: true, message: "Tokens claimed successfully." };
  } catch (error: any) {
    // Keep internal error logging but return generic message
    console.error(`Claim failed: ${error.message}`);
    return { 
      message: error.message, 
      success: false 
    };
  }
}
