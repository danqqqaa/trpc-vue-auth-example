import getPathLength from 'geolib/es/getPathLength';

export type PathPoint = {
  latitude: number;
  longitude: number;
  coordinatesChangedAt: Date;
};

export default (path: string[]) => {
  if (!path) return 0;
  return getPathLength(
    path
      .map(
        (
          h: string,
        ): {
          latitude: number;
          longitude: number;
          coordinatesChangedAt: Date;
        } => JSON.parse(h),
      )
      .sort((a, b) => {
        return (
          (new Date(a.coordinatesChangedAt) as any) -
          (new Date(b.coordinatesChangedAt) as any)
        );
      }),
  );
};
