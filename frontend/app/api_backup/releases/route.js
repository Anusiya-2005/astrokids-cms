import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Release } from '@/lib/models';

export async function GET() {
    try {
        await dbConnect();
        const releases = await Release.find({});
        return NextResponse.json(releases);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const release = await Release.create(body);
        return NextResponse.json(release);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
