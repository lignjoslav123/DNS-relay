const NUMBER_OF_SECONDS_TO_BE_CASHED=Uint8Array.from([23,45])

function bin(buf:Uint8Array){
    let ret=""
    for(const i of buf){
        const b=i.toString(2)
        let s=``
        for(let o=0;o<8-b.length;o++){
            s+='0'
        }
        s+=b+` (${i.toString(16)} || ${i})`
        ret+=` ${s}`
    }
    return ret
}

 
export function concat(buffers:any[]){
    
    function add(buff1:Uint8Array,buff2:Uint8Array){
        let buf3=new Uint8Array(buff1.length+buff2.length)
        let v=0
        for(const i of buff1){
            buf3[v]=i
            v++
        }
        for(const i of buff2){
            buf3[v]=i
            v++
        }
        return buf3
    }
    let ret=Uint8Array.from([])
    for(const i of buffers){ 
        ret=add(ret,i)
    }
    return ret
}


export class headerDNS{
    id:Uint8Array
    info:Uint8Array
    qdcount:Uint8Array
    ancount:Uint8Array
    nscount:Uint8Array
    arcount:Uint8Array

    print(){
        return `id=${bin(this.id)} \ninfo=${bin(this.info)}\nqdcount=${bin(this.qdcount)} \nancount=${bin(this.ancount)} \nnscount=${bin(this.nscount)} \narcount=${bin(this.arcount)}`
    }

    static build(data:Uint8Array){
        const p=new headerDNS()
        p.id=data.slice(0,2)
        p.info=data.slice(2,4)
        p.qdcount=data.slice(4,6)
        p.ancount=data.slice(6,8)
        p.nscount=data.slice(8,10)
        p.arcount=data.slice(10,12) 
        return p
    }

    copyheader(sup:headerDNS){
        this.id=sup.id
        this.info=sup.info
        this.qdcount=sup.qdcount
        this.ancount=sup.ancount
        this.nscount=sup.nscount
        this.arcount=sup.arcount
    }

    getData(){ 
        return concat([this.id,this.info,this.qdcount,this.ancount,this.nscount,this.arcount])
    }
}
 
export class requestDNS extends headerDNS{
    qname:Uint8Array
    qtype:Uint8Array
    qclass:Uint8Array
    static build(data:Uint8Array){
        const p=new requestDNS()
        p.copyheader(super.build(data))
        p.qclass=data.slice(data.length-2,data.length)
        p.qtype=data.slice(data.length-4,data.length-2)
        p.qname=data.slice(12,data.length-4)
        return p
    }

    print(){
        let s=super.print()
        s+=`\ndomaine= ${this.qname.toString()}`
        return s
    }
    getData(){ 
        return concat([super.getData(),this.qname,this.qtype,this.qclass])
    }

}

export class responseDNS extends headerDNS{
aname:Uint8Array
type:Uint8Array
class:Uint8Array
ttl:Uint8Array
rdlengh:Uint8Array
rdata:Uint8Array

    static responde(req:requestDNS,adress:[number]){ 
        const ret=new responseDNS()
        ret.copyheader(req)
        ret.info=Uint8Array.from([129,128])
        ret.ancount=Uint8Array.from([0,1])
        ret.aname=req.qname
        ret.qdcount=Uint8Array.from([0,0])
        ret.type=req.qtype
        ret.class=Uint8Array.from([0,1])
        ret.ttl=NUMBER_OF_SECONDS_TO_BE_CASHED
        ret.rdlengh=Uint8Array.from([0,4])
        ret.rdata=Uint8Array.from(adress)
        return ret
    }

    print(){
        let s=super.print()
        s+=`\ndomaine= ${this.aname.toString()}`
        return s
    }
    getData(){
        return concat([super.getData(),this.aname,this.type,this.class,this.ttl,this.rdlengh,this.rdata])
    }
}