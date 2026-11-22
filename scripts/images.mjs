import sharp from 'sharp'
import {mkdir} from 'node:fs/promises'
await mkdir('public/images/generated',{recursive:true})
// Preserve low-resolution source details: no misleading enlargement is performed.
for (const source of ['product','product-stone']) {
  const input=`public/images/${source}.webp`
  for (const width of [640,1280,1920,3840]) {
    for (const format of ['webp','avif']) {
      await sharp(input).resize({width,withoutEnlargement:true})[format]({quality:78}).toFile(`public/images/generated/${source}-${width}.${format}`)
    }
  }
}
await sharp('public/images/fragrance-illustration-original.png').resize(1200,630,{fit:'cover'}).webp({quality:80}).toFile('public/images/share.webp')
