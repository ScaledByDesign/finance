import { OpenAI } from "openai";
import { getFullUserInfo } from "@/app/actions/user";
import { NextResponse } from "next/server";

async function GPT4(info, key) {
    const openai = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true });

    const GPT4Message = [
        {
            role: "system",
            content:
                "You are personal finance assistant. It's your job to write two short paragraphs containing insights for me to understand my financial position overall. KPIS are live account data and includes the data from last check in. Accounts have all my connected accounts (checkings, credit cards, etc). Provide insights by not just summarizing account balances but instead, providing meaningful analysis for me to take action and reflect on my current financial position. Include overview of balances, changes and a profile based on my spend." 
        },
        {
            role: "user",
            content: info
        }
    ];

    const chat_res = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: GPT4Message,
        temperature: .5,
        max_tokens: 3000,
    });

    // const stream = OpenAIStream(chat_res);
    return chat_res.choices[0];
}

const handler = async (req, res) => {
    try {
        const { data } = req.body;
        const { user } = await getFullUserInfo();
        const aiSummaryResponse = await GPT4(JSON.stringify(user), process.env.OPENAI_API_KEY);
        console.log(aiSummaryResponse);
        return NextResponse.json({ message: aiSummaryResponse.message.content }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: err?.error?.message }, { status: 403 });
    }
};

export { handler as POST };
