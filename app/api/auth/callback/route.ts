import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Add your callback logic here if needed
  // For now, just return a success response to make it a valid module
  return NextResponse.json({ message: 'Auth callback received' }, { status: 200 });
} 