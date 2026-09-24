import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Candy Roses Shop",
    short_name: "Candy Roses",
    start_url: "/",
    display: "standalone",
    background_color: "#fffdfa",
    theme_color: "#fffdfa",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
