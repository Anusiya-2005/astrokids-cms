import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Asset } from '@/lib/models';

export async function GET() {
    try {
        await dbConnect();
        const assets = await Asset.find({});
        return NextResponse.json(assets);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const asset = await Asset.create(body);
        return NextResponse.json(asset);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
