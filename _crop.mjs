import { PNG } from 'pngjs'; import fs from 'node:fs';
const [,, quelle, x,y,w,h, ziel, skala] = process.argv;
const p = PNG.sync.read(fs.readFileSync(quelle));
const [X,Y,W,H] = [x,y,w,h].map(Number); const S = Number(skala||1);
const out = new PNG({ width: W*S, height: H*S });
for (let j=0;j<H*S;j++) for (let i=0;i<W*S;i++){
  const si=((Y+Math.floor(j/S))*p.width+(X+Math.floor(i/S)))*4, di=(j*(W*S)+i)*4;
  for (let k=0;k<4;k++) out.data[di+k]=p.data[si+k];
}
fs.writeFileSync(ziel, PNG.sync.write(out));
