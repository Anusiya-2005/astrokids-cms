import mongoose from 'mongoose';

const ContentTypeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    kind: { type: String, enum: ['collection', 'single'], default: 'collection' },
    fields: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, { timestamps: true });

const EntrySchema = new mongoose.Schema({
    contentTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentTypeV3', required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['draft', 'published', 'scheduled', 'changed'], default: 'draft' },
    scheduledAt: Date,
}, { timestamps: true });

const AssetSchema = new mongoose.Schema({
    name: String,
    alternativeText: String,
    caption: String,
    width: Number,
    height: Number,
    formats: mongoose.Schema.Types.Mixed,
    hash: String,
    ext: String,
    mime: String,
    size: Number,
    url: String,
    previewUrl: String,
    provider: String,
    provider_metadata: mongoose.Schema.Types.Mixed,
    folder: String,
    favorite: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
}, { timestamps: true });

const ReleaseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    scheduledAt: Date,
    status: { type: String, enum: ['pending', 'done', 'failed'], default: 'pending' },
    entries: [{
        entryId: String,
        contentTypeId: String,
    }],
}, { timestamps: true });

export const ContentType = mongoose.models.ContentTypeV3 || mongoose.model('ContentTypeV3', ContentTypeSchema);
export const Entry = mongoose.models.Entry || mongoose.model('Entry', EntrySchema);
export const Asset = mongoose.models.Asset || mongoose.model('Asset', AssetSchema);
export const Release = mongoose.models.Release || mongoose.model('Release', ReleaseSchema);
