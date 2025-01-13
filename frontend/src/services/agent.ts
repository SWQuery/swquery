import api from "./config/api";

export interface QueryRequest {
	inputUser: string;
	address: string;
	openai_key: string;
}

export interface QueryResponse {
	result: QueryResult;
	tokens: number;
}

export interface QueryResult {
	response: string;
	status: string;
	params: unknown;
}

export const generateQuery = async (apiKey: string, payload: QueryRequest) => {
	try {
		const response = await api.post<QueryResponse>(
			"/agent/generate-query",
			payload,
			{
				headers: {
					"x-api-key": apiKey, // TODO: not needed anymore
				},
			}
		);
		return response.data;
	} catch (error: unknown) {
		// console.logerror("Error generating query:", error);
		throw error;
	}
};
