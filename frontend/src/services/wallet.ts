import {
  PublicKey,
  Connection,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";

export class ProgramService {
  private connection: Connection;

  constructor(endpoint: string) {
    this.connection = new Connection(endpoint, "confirmed");
  }

  async buyCredits(
    wallet: WalletContextState,
    recipient: string,
    amount: number
  ): Promise<string> {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    const recipientPublicKey = new PublicKey(recipient);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipientPublicKey,
        lamports: amount,
      })
    );

    const blockhash = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash.blockhash;
    transaction.feePayer = wallet.publicKey;

    const signedTransaction = await wallet.signTransaction?.(transaction);
    if (!signedTransaction) {
      throw new Error("Transaction signing failed");
    }

    const txid = await this.connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    await this.connection.confirmTransaction(txid);
    return txid;
  }
}
