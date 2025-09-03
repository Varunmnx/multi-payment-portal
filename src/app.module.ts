/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service'; 
// import { RolesGuard } from './common/guards/roles.guard';
import { LoggerService } from './common/logger/logger.service'; 
//env dependancy
import { ConfigModule } from '@nestjs/config';
import { ENV } from './env'; 
import { PaymentModule } from './payment/payment.module';

/***
 * App Module for NestJS
 */
@Module({
  imports: [    
  ConfigModule.forRoot({ isGlobal: true, envFilePath: ENV.envFileName()}),
  PaymentModule
  // MongooseModule.forRootAsync({
  //   imports: [ConfigModule],
  //   useFactory: async (configService: ConfigService): Promise<MongooseModuleFactoryOptions> => ({
  //     uri: new MicroserviceEnvVariables(configService).MONGODB_DB_URL,
  //   }),
  //   inject: [ConfigService],
  // }),
  // AuthModule
],
  controllers: [AppController],
  providers: [    
    LoggerService,
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class AppModule {}
