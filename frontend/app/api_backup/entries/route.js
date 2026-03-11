import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Entry } from '@/lib/models';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const contentTypeId = searchParams.get('contentTypeId');

        const query = contentTypeId ? { contentTypeId } : {};
        const entries = await Entry.find(query);
        return NextResponse.json(entries);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const entry = await Entry.create(body);
        return NextResponse.json(entry);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
