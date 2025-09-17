import { getUserInfo, updateUserAccount } from "@/server/user";

export async function getFullUserInfo() {
    const userInfo = await getUserInfo();
    return userInfo;
}

export async function updateUserInfoServerSide(data) {
    const { userInfo } = data;
    await updateUserAccount(userInfo);
}
