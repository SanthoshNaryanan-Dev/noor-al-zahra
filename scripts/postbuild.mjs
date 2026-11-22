import {readFile,writeFile} from 'node:fs/promises'
for(const locale of ['en','ar'])for(const page of ['shop','story']){
 const path=`dist/${locale}/${page}.html`
 let html=await readFile(path,'utf8')
 html=html.replace('<html lang="en">',`<html lang="${locale}" dir="${locale==='ar'?'rtl':'ltr'}">`)
 await writeFile(path,html)
}
