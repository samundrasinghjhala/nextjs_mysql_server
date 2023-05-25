import { JwtModuleAsyncOptions } from "@nestjs/jwt";
import appConfig from "./app.config";


export const JwtConfig: JwtModuleAsyncOptions = {
    useFactory: () => {
        const options = {
            global: true,
            secret: appConfig().appSecret,
            signOptions: appConfig().expirationTime,
        }
        return options;
    }

}