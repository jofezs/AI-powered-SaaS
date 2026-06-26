import { Response } from 'express';
import OpenAI from 'openai';
import { catchAsync } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const chatWithAI = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { messages, systemPrompt } = req.body;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 1000,
  });

  res.status(200).json({
    success: true,
    data: { reply: completion.choices[0].message.content },
  });
});