import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
export function createPreviewServer({development=false}={}){
  const root=path.resolve('dist');const clients=new Set();
  const server=http.createServer((req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'}).end();return;}
    let url,pathname;
    try{url=new URL(req.url,'http://localhost');pathname=decodeURIComponent(url.pathname);}catch{res.writeHead(400).end();return;}
    if(pathname.startsWith('/server/')){res.writeHead(403).end();return;}
    if(pathname.includes('\\')||pathname.includes('\0')||pathname.split('/').some(p=>p.startsWith('.'))){res.writeHead(403).end();return;}
    if(development&&pathname==='/__dev/events'&&req.method==='GET'){
      res.writeHead(200,{'Content-Type':'text/event-stream','Connection':'keep-alive'});res.write(': connected\n\n');clients.add(res);req.on('close',()=>clients.delete(res));return;
    }
    const target=path.resolve(root,'.'+pathname);
    if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    if(pathname.endsWith('/index.html')){res.writeHead(308,{'Location':pathname.slice(0,-10)+url.search}).end();return;}
    let stat;try{stat=fs.statSync(target);}catch{}
    if(stat?.isDirectory()&&!pathname.endsWith('/')){res.writeHead(308,{'Location':pathname+'/'+url.search}).end();return;}
    const file=stat?.isDirectory()?path.join(target,'index.html'):target;
    let content;
    try{if(!fs.statSync(file).isFile())throw Error('Not a file');content=fs.readFileSync(file);}catch{
      res.writeHead(404,{'Content-Type':types['.html']});if(req.method==='HEAD'){res.end();return;}
      try{res.end(fs.readFileSync(path.join(root,'404.html')));}catch{res.end('Page not found. Run npm run build first.');}return;
    }
    if(development&&path.extname(file)==='.html')content=Buffer.from(content.toString().replace('</body>',`<script>const live=new EventSource('/__dev/events');live.addEventListener('reload',()=>location.reload());</script></body>`));
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:content);
  });
  const port=Number(process.env.PORT||4173);
  if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT must be an integer between 1 and 65535.');
  server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`Port ${port} is already in use. Stop the earlier preview, or use a different PORT environment variable.`:error.message);process.exitCode=1;});
  server.listen(port,'127.0.0.1',()=>console.log(`Local URL: http://127.0.0.1:${port}`));
  const close=()=>{for(const client of clients)client.end();server.close();};
  process.once('SIGINT',close);process.once('SIGTERM',close);
  return{server,reload:()=>{for(const client of clients)client.write('event: reload\ndata: ready\n\n');},close};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))createPreviewServer();
