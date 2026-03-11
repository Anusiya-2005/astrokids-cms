import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Release } from '@/lib/models';

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const release = await Release.findByIdAndUpdate(id, body, { returnDocument: 'after' });
        return NextResponse.json(release);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        await Release.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
