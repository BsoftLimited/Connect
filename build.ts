Bun.build({
    entrypoints: ['./src/scripts/home.ts', './src/scripts/streaming.ts', './src/scripts/theme.ts'],
    outdir: './public/js',
    minify: true,
    sourcemap: 'linked',
    splitting: true
}).then(() => {
    console.log("Build completed successfully.");
}).catch((error) => {
    console.error("Build failed:", error);
    process.exit(1);
});