import { CodeExample } from "@/components/Atoms/CodeExample";
import { Explanation } from "./Explanation";

export const Intro: React.FC = () => {
	return (
		<main className={`container mx-auto px-4 py-16`}>
			<div className="flex flex-col md:flex-row gap-8 items-center">
				<div className="w-full md:w-1/2">
					<Explanation />
				</div>
				<div className="w-full md:w-1/2">
					<CodeExample
						code={`use swquery::SWqueryClient;

fn main() {
    let client = SWqueryClient::new();

    // Define your natural language query
    let query = "Show all transactions over 10 SOL in the past week";

    // Execute the query
    match client.query_wallet("YourWalletAddressHere", query) {
        Ok(response) => println!("Query Result: {:?}", response),
        Err(e) => eprintln!("Error: {:?}", e),
    }
}`}
					/>
				</div>
			</div>
		</main>
	);
};
