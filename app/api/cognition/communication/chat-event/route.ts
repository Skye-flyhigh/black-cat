import { NextRequest, NextResponse } from 'next/server';
import { daemonService } from '../../engine/daemon/daemon-service';
import { ChatEvent } from '../../engine/daemon/CognitionDaemon';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the chat event
    const { user, utterance, timestamp, role } = body;
    
    if (!utterance || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: utterance and role' },
        { status: 400 }
      );
    }

    if (role !== 'user' && role !== 'assistant') {
      return NextResponse.json(
        { error: 'Role must be either "user" or "assistant"' },
        { status: 400 }
      );
    } //TODO: With time, I would like to go beyond from the "user" & "assistant" and start to name the source, e.g. "cat", "Skye", "Echo", "Mirror", or "human" & "AI"/ "anonymous" when the system haven't identified them.

    const chatEvent: ChatEvent = {
      type: 'chat_event',
      user: user || 'anonymous',
      utterance,
      timestamp: timestamp || Date.now(),
      role
    };

    // Send to daemon for observation
    await daemonService.observeChat(chatEvent);

    console.log(`🗣️ [ChatEvent] Observed: ${role} - ${utterance.substring(0, 50)}...`);

    return NextResponse.json({
      success: true,
      message: 'Chat event observed by cognition daemon'
    });

  } catch (error) {
    console.error('🗣️ [ChatEvent] Error processing chat event:', error);
    return NextResponse.json(
      { error: 'Failed to process chat event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Health check for chat event endpoint
  return NextResponse.json({
    endpoint: 'chat-event',
    status: 'active',
    daemonHealth: daemonService.isHealthy()
  });
}