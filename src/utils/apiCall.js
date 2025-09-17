import axios from "axios";
import { getSession } from "next-auth/react";

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
    const session = await getSession();
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
