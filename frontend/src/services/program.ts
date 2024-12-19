import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    TransactionInstruction,
} from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

const PROGRAM_ID = new PublicKey("99999999999999999999999999999999999999999999"); // Your program ID
const TREASURY = new PublicKey("TREASURY_ACCOUNT_PUBLIC_KEY"); // Your treasury account public key
const USDC_MINT = new PublicKey("USDC_TOKEN_MINT_ADDRESS"); // SPL USDC mint address
const CREDITS_SEED = "credits"; // Seed used in PDA derivation

async function deriveCreditsAccount(
    buyerPublicKey: PublicKey
): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
        [Buffer.from(CREDITS_SEED), buyerPublicKey.toBuffer()],
        PROGRAM_ID
    );
}

export async function buyCredits(
    connection: Connection,
    wallet: WalletContextState,
    amountUSDC: number
): Promise<void> {
    if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
    }

    if (!wallet.signTransaction) {
        throw new Error("Wallet does not support signing transactions. Please use a compatible wallet.");
    }

    const [creditsAccountPDA, bump] = await deriveCreditsAccount(wallet.publicKey);

    const buyerTokenAccounts = await connection.getTokenAccountsByOwner(wallet.publicKey, {
        mint: USDC_MINT,
    });

    if (buyerTokenAccounts.value.length === 0) {
        throw new Error("No USDC token account found for the buyer");
    }

    const buyerTokenAccount = buyerTokenAccounts.value[0].pubkey;

    const instructionData = Buffer.alloc(9);
    instructionData.writeBigUInt64LE(BigInt(amountUSDC), 0);
    instructionData.writeUInt8(bump, 8);

    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: false }, // Buyer
            { pubkey: buyerTokenAccount, isSigner: false, isWritable: true }, // Buyer's USDC account
            { pubkey: TREASURY, isSigner: false, isWritable: true }, // Treasury
            { pubkey: creditsAccountPDA, isSigner: false, isWritable: true }, // Credits account
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // System program
        ],
        programId: PROGRAM_ID,
        data: instructionData,
    });

    const transaction = new Transaction().add(instruction);

    try {
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;

        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
            skipPreflight: false,
            preflightCommitment: "processed",
        });

        console.log("Transaction signature:", signature);

        await connection.confirmTransaction(signature, "processed");
        console.log("Transaction confirmed!");
    } catch (error) {
        console.error("Transaction failed:", error);
        throw error;
    }
}
