
import { Connection, Keypair, Transaction, TransactionInstruction } from "@solana/web3.js"
import programSeed from "../deploy/test-ts-keypair.json"

const programKeypair = Keypair.fromSecretKey(new Uint8Array(programSeed))
const program = programKeypair.publicKey
const signerSeed = JSON.parse(process.env.SIGNER!)
const signer = Keypair.fromSecretKey(new Uint8Array(signerSeed))

const connection = new Connection("http://127.0.0.1:8899", {
    commitment: "confirmed"
})

const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash()
    await connection.confirmTransaction({
        signature,
        ...block,
    })
    return signature
}

const log = async (signature: string): Promise<string> => {
    console.log(`Transaction successful! https://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`)
    return signature
}

const signAndSend = async(tx: Transaction): Promise<string> => {
    const block = await connection.getLatestBlockhash()
    tx.recentBlockhash = block.blockhash
    tx.lastValidBlockHeight = block.lastValidBlockHeight
    const signature = await connection.sendTransaction(tx, [signer])
    return signature
}

describe('hello solana tests', () => {
    it('Logs out "Hello, Solana!"', async () => {
        const tx = new Transaction()
        tx.instructions.push(
            new TransactionInstruction({
            keys: [{
                pubkey: signer.publicKey,
                isSigner: true,
                isWritable: true
            }],
            programId: program
        }))
        await signAndSend(tx).then(confirm).then(log);
    });
});
