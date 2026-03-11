import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { ContentType } from '@/lib/models';

export async function GET() {
    try {
        await dbConnect();
        const contentTypes = await ContentType.find({});
        return NextResponse.json(contentTypes);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        console.log('API POST ContentType - Body:', JSON.stringify(body, null, 2));
        console.log('API POST ContentType - fields type:', typeof body.fields, Array.isArray(body.fields) ? 'array' : 'not array');
        if (Array.isArray(body.fields)) {
            console.log('API POST ContentType - first field:', JSON.stringify(body.fields[0], null, 2));
        }
        const contentType = await ContentType.create(body);
        return NextResponse.json(contentType);
    } catch (error) {
        console.error('API POST ContentType - Error:', error);
        return NextResponse.json({
            error: error.message,
            details: error.errors ? Object.keys(error.errors).map(key => ({
                path: key,
                message: error.errors[key].message
            })) : null
        }, { status: 500 });
    }
}
