export const authenticateRequest = (req) => {
    const apiKey = req.headers['x-api-key'];
    return apiKey === process.env.PUBLIC_API_KEY;
};