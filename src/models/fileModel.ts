import { Schema, model } from "mongoose";

export interface File {
    title: string;
    content: string;
    size: number;
    modified: string;
}

const fileSchema = new Schema<File>({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    modified: {
        type: String,
        default: " "
    }
});

const FileModel = model<File>("File", fileSchema);
export default FileModel;