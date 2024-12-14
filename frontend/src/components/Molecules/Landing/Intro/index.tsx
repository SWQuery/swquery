import { CodeExample } from "@/components/Atoms/CodeExample";
import { Explanation } from "./Explanation";


export const Intro = () => {
    return (
        <main className="container mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
            <Explanation />  

            <CodeExample code={`pub fn get_token_transactions(
    address: &str,
    period: Vec<u64, u64>
) -> TokenTransactionResponse {
    todo!("Not implemented yet");
}`} />
        </main>
    )
};