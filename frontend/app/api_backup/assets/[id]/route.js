import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Asset } from '@/lib/models';

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const asset = await Asset.findByIdAndUpdate(id, body, { returnDocument: 'after' });
        return NextResponse.json(asset);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        await Asset.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
