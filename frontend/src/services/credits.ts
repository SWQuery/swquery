import api from "./api";

export const buyCredits = async (user_pubkey: string, amount: number) => {
  try {
    const response = await api.post("/credits/buy", { user_pubkey, amount });
    return response.data;
  } catch (error: unknown) {
    console.error("Error buying credits:", error);
    throw error;
  }
};

export const refundCredits = async (user_pubkey: string, amount: number) => {
  try {
    const response = await api.post("/credits/refund", { user_pubkey, amount });
    return response.data;
  } catch (error) {
    console.error("Error refunding credits:", error);
    throw error;
  }
};
