import db from '@/lib/db';

export const getUserAccessToken = async (userId) => {
    const user = await db.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            ACCESS_TOKEN: true,
        },
    });
    return user?.ACCESS_TOKEN || null;
};

export const authenticateRequest = (req) => {
    const apiKey = req.headers['x-api-key'];
    return apiKey === process.env.PUBLIC_API_KEY;
};