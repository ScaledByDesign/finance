import apiCall from "@/utils/apiCall";
import { handleError } from "@/utils/util";

export async function getChats() {
    try {
        const chat = await apiCall.get("/api/v1/chat");

        if (!chat) {
            return [];
        }

        return chat;
    } catch (error) {
        return [];
    }
}

export async function getChat(id) {
    const chat = await apiCall.get(`/api/v1/chat/${id}`);

    if (!chat) {
        return null;
    }

    return chat;
}

export async function removeChat({ id }) {
    return await apiCall.delete(`/api/v1/chat/${id}`);
}

export async function clearChats() {
    return await apiCall.delete("/api/v1/chat/all");
}

export async function getAIResponse(data) {
    try {
        return await apiCall.post("/api/aiResponse", { data });
    } catch (error) {
        handleError(error);
    }
}
