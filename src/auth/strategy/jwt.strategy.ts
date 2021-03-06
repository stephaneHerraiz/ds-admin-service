import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from '../interface/jwt.interface';
import { UserRepository } from '../repository/user.repository';
import { UserEntity } from '../entity/user.entity';
import { jwtConfig } from 'src/shared/constant/config.constant';
import { JWT_TOKEN_HEADERS_NAME } from '../constant/jwt.constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private logger = new Logger('JwtStrategy');

    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromHeader(JWT_TOKEN_HEADERS_NAME),
            secretOrKey: process.env.JWT_SECRET || jwtConfig.secret
        });
    }

    async validate(payload: JwtPayloadInterface): Promise<UserEntity> {
        try {
            const user = await this.userRepository.findOne({username: payload.username});

            if (!user) {
                throw new UnauthorizedException();
            }

            return user;
        } catch (error) {
            this.logger.error(`[validate] payload ${JSON.stringify(payload)}`, error.stack);
            throw new InternalServerErrorException();
        }
    }
}
