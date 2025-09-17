'use server'

import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getFullUserInfo() {
    // Check if we should use demo mode first
    const { isDemoMode } = await import('../../lib/demoData');
    if (isDemoMode()) {
        // Return demo user for chat functionality
        return {
            id: 'demo-user-001',
            name: 'Demo User',
            email: 'demo@finance.app',
            image: '/demo-avatar.png',
            isNewUser: false,
            isAdmin: false
        };
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return null;
    }
    return session.user;
}

export async function getAccessToken() {
    const { accessToken } = await getServerSession(authOptions);
    return accessToken;
}

const CancelToken = axios.CancelToken;
const source = CancelToken.source();

const apiCall = axios.create({
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    },
    timeout: 240000,
    cancelToken: source.token
});

apiCall.interceptors.request.use(async config => {
    const session = await getServerSession(authOptions);
    const lang = global.window && window.location.href.split("/")[3];

    if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session?.accessToken}`;
    }
    config.headers.lang = lang ? lang : "en";
    return config;
});

apiCall.interceptors.response.use(response => {
    return response;
});

export default apiCall;