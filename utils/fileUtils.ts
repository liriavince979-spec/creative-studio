
/**
 * Converts a File object to a base64 encoded string and its MIME type.
 * @param {File} file The file to convert.
 * @returns {Promise<{base64: string, mimeType: string}>} A promise that resolves with the base64 string (without the data URL prefix) and the file's MIME type.
 */
export const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // The result is a data URL like "data:image/jpeg;base64,..."
      // We need to split it to get the MIME type and the base64 data.
      const parts = result.split(',');
      if (parts.length !== 2) {
        return reject(new Error('Invalid file format for base64 conversion.'));
      }
      const mimeType = parts[0].split(':')[1].split(';')[0];
      const base64 = parts[1];
      resolve({ base64, mimeType });
    };
    reader.onerror = (error) => reject(error);
  });
};
