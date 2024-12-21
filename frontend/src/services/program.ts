import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    TransactionInstruction,
  } from "@solana/web3.js";
  import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
  
  // TODO: Transform in global constants
  const SOLANA_NETWORK = "https://api.devnet.solana.com";
  const PROGRAM_ID = new PublicKey("CTi1Genj9Ev3rRXGHfaqqMHtjh2uSBEXSyfVxG6dyGBQ");
  const TREASURY_PUBKEY = new PublicKey("2nuW7MWYsGdLmsSf5mHrjgn6NqyrS5USai6fdisnUQc4");
  
  export const buyCredits = async (
    buyerKeypair: Keypair,
    buyerTokenAccount: PublicKey,
    amountUSDC: number
  ) => {
    const connection = new Connection(SOLANA_NETWORK, "confirmed");
  
    const [creditsAccount, bump] = await PublicKey.findProgramAddress(
      [Buffer.from("credits_account"), buyerKeypair.publicKey.toBuffer()],
      PROGRAM_ID
    );
  
    const instructionData = Buffer.alloc(9);
    const writeBigUInt64LE = (buffer: Buffer, value: bigint, offset: number) => {
      const low = Number(value & BigInt(0xffffffff));
      const high = Number(value >> BigInt(32));
      buffer.writeUInt32LE(low, offset);
      buffer.writeUInt32LE(high, offset + 4);
    };
  
    writeBigUInt64LE(instructionData, BigInt(amountUSDC), 0);
    instructionData.writeUInt8(bump, 8);
  
    const instruction = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: buyerKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: buyerTokenAccount, isSigner: false, isWritable: true },
        { pubkey: TREASURY_PUBKEY, isSigner: false, isWritable: true },
        { pubkey: creditsAccount, isSigner: false, isWritable: true },
        { pubkey: PublicKey.default, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data: instructionData,
    });
  
    const transaction = new Transaction().add(instruction);
  
    transaction.feePayer = buyerKeypair.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.sign(buyerKeypair);
  
    const signature = await connection.sendTransaction(transaction, [buyerKeypair]);
    await connection.confirmTransaction(signature, "confirmed");
  
    return signature;
  };
  
