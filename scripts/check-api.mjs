import {createServer} from 'vite'
const server=await createServer({server:{middlewareMode:true,ws:false},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'})
try {
 const {onRequestPost}=await server.ssrLoadModule('/functions/api/[[path]].ts')
 const env={APP_ORIGIN:'https://shop.example',RATE_LIMITER:{limit:async()=>({success:true})},ORDERS:{get:async()=>null,put:async()=>{}}}
 const request=(path,body,origin='https://shop.example')=>new Request(`https://shop.example/api/${path}`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)})
 const check=async(path,body,expected,origin)=>{const result=await onRequestPost({request:request(path,body,origin),env,params:{path:[path]}});if(result.status!==expected)throw Error(`${path}: expected ${expected}, got ${result.status}`)}
 await check('enquiry',{name:'Test',message:'Hello',consent:true,website:'spam'},400)
 await check('enquiry',{name:'Test',message:'Hello',consent:true},403,'https://other.example')
 await check('verify',{razorpay_order_id:'bad'},400)
 await check('order',{name:'Test Customer',phone:'1234567890',email:'test@example.com',address:'123 Example Street',pincode:'560001',consent:true,items:[{id:'oud',quantity:1}]},503)
 console.log('API validation checks passed')
}finally{await server.close()}
