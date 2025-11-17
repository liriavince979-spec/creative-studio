
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, VeoOperation } from "../types";

// This service handles the logic for interacting with the Google Gemini API.

/**
 * Generates an image using the Imagen model.
 * @param {string} prompt The text prompt describing the image to generate.
 * @returns {Promise<string>} A promise that resolves to the base64 encoded image string.
 */
export const generateImage = async (prompt: string): Promise<string> => {
  // A new instance is created for each call to ensure the latest API key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes;
    } else {
      throw new Error('No image was generated. The response may have been blocked.');
    }
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate image. Please check the console for details.');
  }
};

/**
 * Generates a video using the Veo model from a prompt and an initial image.
 * This function handles the long-running operation by polling until the video is ready.
 * @param {string} prompt The text prompt describing the animation.
 * @param {string} imageBase64 The base64 encoded string of the source image.
 * @param {string} mimeType The MIME type of the source image.
 * @param {AspectRatio} aspectRatio The desired aspect ratio for the output video.
 * @returns {Promise<string>} A promise that resolves to a local URL for the generated video.
 */
export const generateVideo = async (
  prompt: string,
  imageBase64: string,
  mimeType: string,
  aspectRatio: AspectRatio
): Promise<string> => {
  // Veo requires its own API key selection, so we instantiate the client here
  // to ensure it uses the key selected via the `window.aistudio` dialog.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    let operation: VeoOperation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
            imageBytes: imageBase64,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });

    // Video generation is asynchronous, so we need to poll the operation status.
    while (!operation.done) {
      // Wait for 10 seconds before checking the status again.
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.response?.generatedVideos?.[0]?.video?.uri) {
        const downloadLink = operation.response.generatedVideos[0].video.uri;
        // The download link requires the API key to be appended for access.
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            throw new Error(`Failed to download video: ${videoResponse.statusText}`);
        }
        const videoBlob = await videoResponse.blob();
        return URL.createObjectURL(videoBlob);
    } else {
        throw new Error('Video generation finished but no video URI was found.');
    }
  } catch (error) {
    console.error('Error generating video:', error);
    if(error instanceof Error) {
        throw error;
    }
    throw new Error('Failed to generate video. Please check the console for details.');
  }
};
