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
    data:any,
    status:number,
    message:string
})=>{
    return res.status(status).json({
        data,
        status,
        message,
        ok:status>=200 && status<300
    });
}