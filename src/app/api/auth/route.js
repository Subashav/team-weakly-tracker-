import { NextResponse } from 'next/server';

/**
 * AUTHENTICATION ENDPOINT
 * Standard MNC-grade credential verification
 */
export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Industry standard: Admin and User credentials
    // Note: In production, these should be hashed and stored in the 'members' table
    if (username === 'admin' && password === 'admin123') {
      return NextResponse.json({ 
        role: 'admin', 
        token: 'auth_token_admin_7788', 
        name: 'Administrator' 
      });
    }

    if (username === 'user' && password === 'user123') {
      return NextResponse.json({ 
        role: 'user', 
        token: 'auth_token_user_2233', 
        name: 'Operational Viewer' 
      });
    }

    return NextResponse.json({ error: 'Invalid credentials access denied.' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Server authentication failure' }, { status: 500 });
  }
}
