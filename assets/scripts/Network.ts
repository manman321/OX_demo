import EventCustoms from "./CustomEvents";
import GlobalConfig from "./config/GlobalConfig"

export default class Network {
    private static _instance = null
    private static _websocket:WebSocket = null
    private customEvent:EventCustoms = null

    public static getInstacne():Network{
        if(Network._instance == null){
            Network._instance = new Network()
        }

        return Network._instance
    }

    public connect(wsAddress:string){
        if(Network._websocket){
            console.log("socket 存在即将关闭")
            Network._websocket.close()
            Network._websocket = null
        }
        
        this._init()
        Network._websocket = new WebSocket(wsAddress)
        Network._websocket.binaryType = 'arraybuffer'
        Network._websocket.onopen = this._onOpen.bind(this)
        Network._websocket.onclose = this._onClose.bind(this)
        Network._websocket.onmessage = this._onMessage.bind(this)
        Network._websocket.onerror = this._onError.bind(this)
    }

    public getNetworkStatus():number{
        return Network._websocket.readyState
    }

    public send(data){
        if(data === null){
            console.log("不可发送 null 消息")
            return
        }

        let strData = ""
        try{
            strData = JSON.stringify(data)
            if(GlobalConfig._cryptEnable){

            }
        }catch(e){
            console.log("编码数据失败:", e)
        }

        if(this.getNetworkStatus() != Network._websocket.CLOSED){
            Network._websocket.send(strData)
        }else{
            console.log("未连接服务器！")
        }
        
    }

    private _init(){
        this.customEvent = EventCustoms.getInstacne()
    }

    private _onOpen(){
        let data = {}
        this.customEvent.dispatch('connected', data)
    }

    private _onClose(event){
        if(Network._websocket){
            Network._websocket.close()
            Network._websocket = null
        }
        
        //this.customEvent.dispatch('close', event.data)
    }

    private _onMessage(event){
        let data:any = null
        if(!event.data){

            return
        }

        try{
            data = JSON.parse(event.data)
        }catch(e){
            console.log("解析json字符串错误:",e)
            return
        }

        if(data == null || data.type == "Ping" || data.type == "Pong"){
            return
        }

        cc.log(data)
        this.customEvent.dispatch('message', data)
    }

    private _onError(event){
        //this.customEvent.dispatch('error', event.data)
    }
}
