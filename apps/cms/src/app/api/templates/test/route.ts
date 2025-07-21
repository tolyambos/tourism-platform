import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const { systemPrompt, userPrompt, schema, testData } = body;
  
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'Gemini API key not configured' },
      { status: 500 }
    );
  }
  
  try {
    // Initialize Gemini
    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
    
    // Use the same API structure as in gemini-generator.ts
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: userPrompt
            }
          ]
        }
      ],
      config: {
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: schema,
        systemInstruction: systemPrompt ? [{ text: systemPrompt }] : undefined
      }
    });
    
    const text = response.text || '';
    
    // Parse the response
    let content;
    try {
      content = JSON.parse(text);
    } catch (error) {
      // If JSON parsing fails, return the raw text
      content = { raw: text };
    }
    
    return NextResponse.json({
      content,
      model: 'gemini-2.5-pro',
      usage: response.usageMetadata ? {
        promptTokens: response.usageMetadata.promptTokenCount || 0,
        completionTokens: response.usageMetadata.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata.totalTokenCount || 0
      } : null
    });
    
  } catch (error) {
    console.error('Error testing template:', error);
    
    // Extract error message
    let errorMessage = 'Failed to generate content';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}