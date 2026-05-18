import { useCallback } from "react";

export function useImageUpload() {
  const readFileAsDataURL = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const readFilesAsDataURLs = useCallback(
    async (files: FileList | File[]): Promise<string[]> => {
      const arr = Array.from(files);
      return Promise.all(arr.map((f) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      })));
    },
    []
  );

  return { readFileAsDataURL, readFilesAsDataURLs };
}
