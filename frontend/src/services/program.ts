// import { start } from "solana-bankrun";
// import { Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
// import { BN } from "@coral-xyz/anchor";

// /**
//  * Função para comprar créditos enviando uma transferência no blockchain Solana.
//  * @param transferDescription - Descrição da transferência (opcional, para logging).
//  */
// export async function buyCredits(transferDescription: string = "Transferência padrão") {
//   try {
//     console.log(`Iniciando: ${transferDescription}`);

//     // Inicializa o contexto usando "solana-bankrun"
//     const context = await start([], []);
//     const client = context.banksClient;
//     const payer = context.payer; // Assumindo que `payer` é um `Keypair`
//     const blockhash = context.lastBlockhash;

//     // Cria o receiver (destinatário) como um Keypair novo
//     const receiver = Keypair.generate();
//     const transferLamports = new BN(1 * LAMPORTS_PER_SOL);

//     // Cria a instrução de transferência
//     const transferInstruction = SystemProgram.transfer({
//       fromPubkey: payer.publicKey,
//       toPubkey: receiver.publicKey,
//       lamports: transferLamports.toNumber(),
//     });

//     // Monta a transação
//     const transaction = new Transaction().add(transferInstruction);
//     transaction.recentBlockhash = blockhash;
//     transaction.feePayer = payer.publicKey;

//     // Assina a transação
//     transaction.sign(payer);

//     // Processa a transação
//     const txSignature = await client.processTransaction(transaction);
//     console.log(`Transação enviada com sucesso: ${txSignature}`);

//     // Verifica o saldo do destinatário
//     const balanceAfter = await client.getBalance(receiver.publicKey);
//     console.log(`Saldo do destinatário após transferência: ${Number(balanceAfter) / LAMPORTS_PER_SOL} SOL`);

//     return { txSignature, balanceAfter };
//   } catch (error) {
//     console.error("Erro ao executar a compra de créditos:", error);
//     throw error;
//   }
// }
