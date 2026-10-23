import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly redis: Redis;

    constructor() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
            tls: {rejectUnauthorized: false},
            connectTimeout: 1000,
            maxRetriesPerRequest: 3,
        });
    }

    async set(key: string, value: string, ttl?: number){
        if(ttl){
            return this.redis.set(key, value, 'EX', ttl);
        }
        return this.redis.set(key, value);
    }

    async get(key: string) {
        return this.redis.get(key);
    }

    async del(key: string){
        return this.redis.del(key);
    }

    async onModuleDestroy(){
        await this.redis.quit();
    }
}