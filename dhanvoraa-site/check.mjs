import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files=walk(root);let count=0;
const config=JSON.parse(fs.readFileSync('site.config.json','utf8'));
for(const file of files.filter(f=>f.endsWith('index.html'))){
 const html=fs.readFileSync(file,'utf8');count++;
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`One H1: ${file}`);
 assert.match(html,/<title>[^<]+<\/title>/);assert.match(html,/<meta name="description" content="[^"]+">/);
 assert.match(html,/<link rel="canonical" href="https:\/\//);assert.ok(!html.includes('[PLACEHOLDER:'),`No unfilled spreadsheet markers: ${file}`);
 for(const schema of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs))JSON.parse(schema[1]);
 for(const match of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)){
  const local=match[1].split('?')[0];const target=path.join(root,local);assert.ok(fs.existsSync(path.extname(local)?target:path.join(target,'index.html')),`Local reference exists: ${local}`);
 }
 for(const cta of html.matchAll(/<a [^>]*data-start[^>]*>/g)){assert.ok(cta[0].includes(config.augmontUrl||config.augmontDemoUrl));assert.ok(cta[0].includes('rel="noopener noreferrer"'));}
}
const xml=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
assert.match(xml,/<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
for(const loc of xml.matchAll(/<loc>([^<]+)<\/loc>/g)){const u=new URL(loc[1]);assert.ok(fs.existsSync(path.join(root,u.pathname,'index.html')));assert.ok(!fs.readFileSync(path.join(root,u.pathname,'index.html'),'utf8').includes('noindex'));}
assert.equal(fs.readFileSync(path.join(root,'robot.txt'),'utf8'),fs.readFileSync(path.join(root,'robots.txt'),'utf8'));
assert.equal(fs.readFileSync(path.join(root,'site.xml'),'utf8'),xml);
console.log(`PASS: ${count} pages, metadata, structured data, internal links, external CTAs, and sitemap aliases.`);
