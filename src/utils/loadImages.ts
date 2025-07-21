export async function loadImagesAsBase64(
  filenames: string[]
): Promise<Record<string, string>> {
  const base64Images: Record<string, string> = {};

  for (const filename of filenames) {
    const response = await fetch(`/images/${filename}`);
    const blob = await response.blob();

    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    base64Images[filename] = base64;
  }

  return base64Images;
}
