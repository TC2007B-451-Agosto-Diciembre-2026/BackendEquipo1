import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { DatabaseModule } from "src/database/database.module";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { UsersRepository } from "./users.repository";
import { UsersController } from './users.controller';

@Module({
    imports: [DatabaseModule, ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }])],
    controllers: [AuthController, UsersController],
    providers: [AuthService, UsersRepository, AuthGuard],
    exports: [AuthGuard],
})
export class AuthModule {}