import { NextResponse } from "next/server";
import { getTransaction } from "../../../../../server/transaction";

export async function POST(req) {
  try {
    // Add better JSON parsing with validation
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (jsonError) {
      console.error('Invalid JSON in request:', jsonError);
      return NextResponse.json({
        message: 'Invalid JSON in request body',
        status: 400,
      });
    }

    const { filter } = requestBody;
    if (!filter) {
      console.error('Missing filter in request body');
      return NextResponse.json({
        message: 'Filter is required',
        status: 400,
      });
    }

    console.log('Transaction API called with filter:', JSON.stringify(filter, null, 2));
    const data = await getTransaction(filter);
    console.log('Transaction API returning data:', { size: data.size, dataLength: data.data.length });
    return NextResponse.json(data);
  } catch (err) {
    console.error('Transaction API error:', err);
    return NextResponse.json({
      message: err.message,
      status: 500,
    });
  }
}