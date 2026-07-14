async function PhotoGallery(imagekitPath, container) {
    const privateKey = "private_vLz0sDfhlRbELEDw3DsCX2KSVVQ=";
    const urlEndpoint = "https://ik.imagekit.io/dallasurbanists";
    const authHeader = 'Basic ' + btoa(privateKey + ':');
    const transformUrl = (path, maxDimension) => `${urlEndpoint}/tr:w-${maxDimension},h-${maxDimension},c-at_max${path}`;
    try {
        // Fetch all images from the given folder
        const response = await fetch(
            `https://api.imagekit.io/v1/files?path=${imagekitPath}&type=file&fileType=image&limit=1000`,
            { method: 'GET', headers: { 'Authorization': authHeader } });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const files = await response.json();
        const thumbnails = files.map(file => {
            return {
                originalUrl: file.url,
                thumbnailUrl: transformUrl(file.filePath, 600),
                largeUrl: transformUrl(file.filePath, 1600),
                name: file.name,
                fileId: file.fileId
            };
        });
        thumbnails.forEach(thumbnail => {
            const a = document.createElement('a');
            a.setAttribute('data-fslightbox', 'gallery');
            a.href = thumbnail.largeUrl;
            const img = document.createElement('img');
            img.src = thumbnail.thumbnailUrl;
            img.alt = thumbnail.name;
            img.loading = "lazy";
            container.appendChild(a);
            a.appendChild(img);
        });
        refreshFsLightbox();
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}