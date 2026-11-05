import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const htmlFile=path.join(dist,'index.html');
let html=await fs.readFile(htmlFile,'utf8');
const base=new URL('./',new URL('https://local.invalid/puls/'));
let count=0;
for(const m of [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)]){
 const href=m[0].match(/href="([^"]+)"/)?.[1];if(!href)continue;
 const url=new URL(href,base);if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))continue;
 const file=path.resolve(dist,url.pathname.slice(base.pathname.length));
 if(!file.startsWith(dist+path.sep))throw Error('CSS path escaped dist');
 let css=await fs.readFile(file,'utf8');
 css=css.replace(/url\((['"]?)([^)'"\s]+)\1\)/g,(all,q,target)=>/^(data:|https?:|\/|#)/.test(target)?all:'url('+JSON.stringify(new URL(target,url).pathname)+')');
 css=css.replaceAll('</style','<\\/style');
 html=html.replace(m[0],'<style data-critical-css="'+href+'">'+css+'</style>');count++;
}
if(!count)throw Error('No entry stylesheets found');
await fs.writeFile(htmlFile,html);console.log('Inlined entry stylesheets:',count);
