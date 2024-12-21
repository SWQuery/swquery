import apiClient from "./config/api";

export async function createUser(pubkey: string) {
  try {
    const response = await apiClient.post("/users", { pubkey });
    return response.data;
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function getUsers() {
  try {
    const response = await apiClient.get("/users");
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getUserByPubkey(pubkey: string) {
  try {
    const response = await apiClient.get(`/users/${pubkey}`);
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching user by pubkey:", error);
    throw error;
  }
}