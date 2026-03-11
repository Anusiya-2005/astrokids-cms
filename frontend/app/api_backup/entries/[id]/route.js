import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Entry } from '@/lib/models';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const entry = await Entry.findById(id);
        if (!entry) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }
        return NextResponse.json(entry);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const entry = await Entry.findByIdAndUpdate(id, body, { returnDocument: 'after' });
        return NextResponse.json(entry);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        await Entry.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
