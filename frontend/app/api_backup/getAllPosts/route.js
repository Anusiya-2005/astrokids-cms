import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Entry } from '@/lib/models';

export async function GET() {
    try {
        await dbConnect();

        // Fetch all entries that are marked as 'published'
        // This is what the connected website would typically use
        const entries = await Entry.find({ status: 'published' }).sort({ createdAt: -1 });

        return NextResponse.json(entries, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch published posts:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
