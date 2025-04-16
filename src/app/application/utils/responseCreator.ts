import { Response } from "express";

export interface CustomResponse{
    data:any,
    status:number,
    message:string,
    ok:boolean
}

export const responseCreator=(res:Response,{
    data,
    status,
    message
}:{
    data?:any,
    status:number,
    message:string
})=>{
    if(status>=200 && status<300){
        return res.status(status).json({
            data:data||null,
            status,
            message,
            ok:true
        });
    }else{
        let response=res.status(status)
        response.statusMessage=message;
        response.json({
            data:data||null,
            status,
            message,
            ok:false
        })
        return response;
    }
}