import api from "./config/api";

export const buyCredits = async (user_pubkey: string, amount: number) => {
	try {
		const response = await api.post(
			"/credits/buy",
			{ user_pubkey, amount },
			{
				headers: {
					"Content-Type": "application/json",
					"x-api-key": "WDAO4Z1Z503DWJH7060GIYGR0TWIIPBM", // TODO: Not needed anymore
				},
			}
		);
		return response.data;
	} catch (error: unknown) {
		// console.logerror("Error buying credits:", error);
		throw error;
	}
};

export const refundCredits = async (user_pubkey: string, amount: number) => {
	try {
		const response = await api.post(
			"/credits/refund",
			{ user_pubkey, amount },
			{
				headers: {
					"Content-Type": "application/json",
					"x-api-key": "WDAO4Z1Z503DWJH7060GIYGR0TWIIPBM", // TODO: Not needed anymore
				},
			}
		);
		return response.data;
	} catch (error) {
		// console.logerror("Error refunding credits:", error);
		throw error;
	}
};
