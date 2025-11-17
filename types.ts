
export type AspectRatio = '16:9' | '9:16';

export interface VideoGenerationResponse {
    generatedVideos: {
        video: {
            uri: string;
        }
    }[];
}

// A simplified type for the video generation operation
export interface VeoOperation {
    done: boolean;
    response?: VideoGenerationResponse;
}
