export type PhotoPlaneSize = {
  width: number;
  height: number;
};

const PHOTO_PLANE_LONG_EDGE = 1.78;
const FALLBACK_PHOTO_PLANE_SIZE: PhotoPlaneSize = {
  width: 1.12,
  height: PHOTO_PLANE_LONG_EDGE,
};

export function getPhotoPlaneSize(
  imageWidth: number,
  imageHeight: number,
): PhotoPlaneSize {
  if (imageWidth <= 0 || imageHeight <= 0) {
    return FALLBACK_PHOTO_PLANE_SIZE;
  }

  const aspectRatio = imageWidth / imageHeight;
  if (aspectRatio >= 1) {
    return {
      width: PHOTO_PLANE_LONG_EDGE,
      height: PHOTO_PLANE_LONG_EDGE / aspectRatio,
    };
  }

  return {
    width: PHOTO_PLANE_LONG_EDGE * aspectRatio,
    height: PHOTO_PLANE_LONG_EDGE,
  };
}
