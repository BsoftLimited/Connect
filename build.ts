import * as esbuild from "esbuild";
import { solidPlugin } from 'esbuild-plugin-solid';

esbuild.context({
    entryPoints: [ "./src/pages/app.tsx", "./src/pages/login.tsx" ],
    bundle: true,
    outdir: "./public/js",
    sourcemap: true,
    minify: true,
    plugins: [solidPlugin()]
}).then((ctx)=>{
    ctx.watch().then(()=>{ 
        console.log("ESBuild is watching for changes"); 
    }).catch((error)=> console.error(error));
}).catch((error)=> console.error(error));