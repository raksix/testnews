declare module "geoip-lite" {
  interface Geo {
    country: string;
    region: string;
    city: string;
  }
  export function lookup(ip: string): Geo | null;
  const _default: { lookup: typeof lookup };
  export default _default;
}
