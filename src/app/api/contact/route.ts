import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyBoury6NJ2yYqg_l4tYlInc9AbJphRa7vDRjhgIbRuX8M6bQzmxQ0gCWgOdgwFfe_mTQ/exec';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, type } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Send to Google Sheets
    const response = await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name: name || 'Anonymous',
        subject: subject || 'No Subject',
        message,
        type: type || 'contact', // 'support' or 'feedback'
        source: 'contact-form',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit form');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}
