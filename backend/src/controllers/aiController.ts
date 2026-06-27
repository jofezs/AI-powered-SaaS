import { Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { catchAsync } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';

// Initialize Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const chatWithAI = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { messages, systemPrompt } = req.body;

  console.log('Gemini API KEY exists:', !!process.env.GEMINI_API_KEY);
  console.log('Messages received:', messages?.length);

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    if (!messages || messages.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No messages provided',
      });
      return;
    }

    // Convert messages to Gemini history format
    const converted = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Gemini requires the chat history to start with a 'user' message.
    // Skip any initial model (assistant) greeting messages.
    const firstUserIndex = converted.findIndex((m: any) => m.role === 'user');

    const history = firstUserIndex !== -1
      ? converted.slice(firstUserIndex, -1)
      : [];

    const lastMessage = converted[converted.length - 1];

    // If the last message is somehow not a user message, or if no user message was found in the conversation
    if (lastMessage.role !== 'user') {
      res.status(400).json({
        success: false,
        message: 'Last message must be from the user',
      });
      return;
    }

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const reply = result.response.text();

    res.status(200).json({
      success: true,
      data: { reply },
    });
  } catch (err: unknown) {
    console.error('Gemini error:', err);
    throw err;
  }
});