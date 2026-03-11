import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { ContentType } from '@/lib/models';

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const contentType = await ContentType.findByIdAndUpdate(id, body, { returnDocument: 'after' });
        return NextResponse.json(contentType);
    } catch (error) {
        console.error('API PUT ContentType - Error:', error);
        return NextResponse.json({
            error: error.message,
            details: error.errors ? Object.keys(error.errors).map(key => ({
                path: key,
                message: error.errors[key].message
            })) : null
        }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        await ContentType.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
