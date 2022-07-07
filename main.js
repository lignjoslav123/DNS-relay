const {requestDNS,responseDNS,headerDNS,concat}=require('./packet')
const {createSocket,Socket}=require('udp')

async function askGoogle(request){
    const socket=createSocket('udp4')
    socket.send(request,53,'8.8.8.8')
    let ret
    await new Promise(e=>{
        socket.on('message',(data,info)=>{
            ret=data
            e()
        })
    })
    return ret
}

function readBuffer(buf,title){
    let ret=`${title}\nsize=${buf.length}\n`
    for(const i of buf){
        ret+=i.toString(16)+' '
    }
    return ret
}

function buftoarray(buf){
    const arr=new Uint8Array(buf.length)
    for(let i=0;i<arr.length;i++){
        arr[i]=buf[i]
    }
    return arr
}

function main(){

    const server=createSocket('udp4')
    server.bind(53)
    console.log('server started')
    server.on('message',async (data,info)=>{ 
        const req=requestDNS.build(data)   
         
        const res=responseDNS.responde(req,[66,254,114,41])   
        const real_response=await askGoogle(req.getData()) 

        //console.log(readBuffer(data,'real request'))
        //console.log(readBuffer(req.getData(),'my request'))

        console.log(readBuffer(real_response,'real response'))
        console.log(readBuffer(res.getData(),'my response'))

        console.log(req.qname.toString()) 
        server.send(real_response,info.port,info.address)
    })
 
    
}

main()
 