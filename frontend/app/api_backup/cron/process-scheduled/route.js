import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Entry, Release } from '@/lib/models';

export async function GET(request) {
    try {
        await dbConnect();
        const now = new Date();

        // 1. Process individual scheduled entries
        const scheduledEntries = await Entry.find({
            status: 'scheduled',
            scheduledAt: { $lte: now }
        });

        const entryResults = await Promise.all(scheduledEntries.map(async (entry) => {
            entry.status = 'published';
            entry.scheduledAt = null; // Clear scheduling info once published
            await entry.save();
            return entry._id;
        }));

        // 2. Process scheduled releases
        const pendingReleases = await Release.find({
            status: 'pending',
            scheduledAt: { $lte: now }
        });

        const releaseResults = await Promise.all(pendingReleases.map(async (release) => {
            // Update all entries in the release to published
            const entryIds = release.entries.map(e => e.entryId);

            await Entry.updateMany(
                { _id: { $in: entryIds } },
                { $set: { status: 'published', scheduledAt: null } }
            );

            release.status = 'done';
            await release.save();
            return release._id;
        }));

        return NextResponse.json({
            success: true,
            processedEntries: entryResults.length,
            processedReleases: releaseResults.length,
            timestamp: now.toISOString()
        });

    } catch (error) {
        console.error('Cron Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
