import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


export async function POST(request: NextRequest) {
    try {
        const { messages, mode, model = 'gpt-4o' } = await request.json();


        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: 'Неверный формат сообщений' },
                { status: 400 }
            );
        }


        if (mode === 'chat') {
            const completion = await openai.chat.completions.create({
                model,
                messages,
                temperature: 0.7,
                max_tokens: 1000,
            });
            return NextResponse.json({
                content: completion.choices[0].message.content,
                role: 'assistant',
            });
        } else if (mode === 'image') {
            const lastMessage = messages[messages.length - 1];
            const imageResponse = await openai.images.generate({
                model: 'dall-e-3',
                prompt: lastMessage.content,
                n: 1,
                size: '1024x1024',
                quality: 'hd',
                style: 'vivid',
            });
            if (!imageResponse.data || !Array.isArray(imageResponse.data) || imageResponse.data.length === 0) {
                return NextResponse.json({ error: 'Ошибка: изображение не получено' }, { status: 500 });
            }
            return NextResponse.json({
                content: imageResponse.data[0].url,
                role: 'assistant',
                type: 'image',
            });
        }


        return NextResponse.json({ error: 'Неверный режим' }, { status: 400 });
    } catch (error) {
        console.error('Ошибка API:', error);
        if (error instanceof OpenAI.APIError) {
            return NextResponse.json(
                { error: `Ошибка API OpenAI: ${error.message}` },
                { status: error.status || 500 }
            );
        }
        return NextResponse.json(
            { error: 'Не удалось обработать запрос' },
            { status: 500 }
        );
    }
}
