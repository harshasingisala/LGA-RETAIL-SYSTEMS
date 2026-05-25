// PURPOSE: Connects Tailwind CSS and Autoprefixer to Vite's CSS pipeline.
// USAGE: PostCSS reads this file while compiling `src/index.css`.

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
