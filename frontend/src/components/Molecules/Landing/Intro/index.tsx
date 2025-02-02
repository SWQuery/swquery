"use client";

import { CodeExample } from "@/components/Atoms/CodeExample";
import { Explanation } from "./Explanation";

export const Intro: React.FC = () => {
	return (
		<main className="container mx-auto px-4 py-16 space-y-24">
			<div className="grid md:grid-cols-2 gap-8 items-center">
				<div className="space-y-6">
					<Explanation />
				</div>
				<div className="w-full">
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

			<div className="flex md:flex-col flex-col-reverse md:grid gap-4 md:gap-8 items-center px-4 md:px-6">
			</div>
		</main>
	);
};
