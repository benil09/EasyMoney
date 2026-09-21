import { PrismaClient } from '../../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { ShardId } from '../types/shared-types';

// # Create a separate prisma client for each shard using the driver adapter
// # Each connection manages its own connection pool via maria DB
// # So instead of using prisma pool we will use maria db pool
// # if there are many shards it will create many clients so to handle this use map
// # map of shardId to its prisma client


let shard1Client: PrismaClient | null = null;
let shard2Client: PrismaClient | null = null;

export function getShard1AdapterOption() {
    const url = process.env.DATABASE_URL_SHARD_1;
    if (url) {
        const u = new URL(url);
        try {
            host: u.hostname;
            port: parseInt(u.port || '3306', 10);
            user: u.username;
            password: u.password;
            database: u.pathname.replace(/^\//, '') || 'easymoney_shard1';
            connectionLimit: 5;
        } catch (error) {
            throw new Error(`Invalid DATABASE_URL_SHARD_1: ${url}`);
        }
    }
    return {
        host: process.env.DATABASE_HOST_SHARD_1,
        port: parseInt(process.env.DATABASE_PORT_SHARD_1 || '3306', 10),
        user: process.env.DATABASE_USER_SHARD_1,
        password: process.env.DATABASE_PASSWORD_SHARD_1,
        database: process.env.DATABASE_NAME_SHARD_1 || 'easymoney_shard1',
        connectionLimit: 5,
    }
}
export function getShard2AdapterOption() {
    const url = process.env.DATABASE_URL_SHARD_2;
    if (url) {
        const u = new URL(url);
        try {
            host: u.hostname;
            port: parseInt(u.port || '3306', 10);
            user: u.username;
            password: u.password;
            database: u.pathname.replace(/^\//, '') || 'easymoney_shard2';
            connectionLimit: 5;
        } catch (error) {
            throw new Error(`Invalid DATABASE_URL_SHARD_2: ${url}`);
        }
    }
    return {
        host: process.env.DATABASE_HOST_SHARD_2,
        port: parseInt(process.env.DATABASE_PORT_SHARD_2 || '3306', 10),
        user: process.env.DATABASE_USER_SHARD_2,
        password: process.env.DATABASE_PASSWORD_SHARD_2,
        database: process.env.DATABASE_NAME_SHARD_2 || 'easymoney_shard2',
        connectionLimit: 5,
    }
}

export function getShard1Client() {
    // lazy singleton : avoid creating new pools per request/import
    if (!shard1Client) {
        const adapter = new PrismaMariaDb(getShard1AdapterOption());
        shard1Client = new PrismaClient({
            adapter,
            log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        })
    }
    return shard1Client
}
export function getShard2Client() {
    if (!shard2Client) {
        const adapter = new PrismaMariaDb(getShard2AdapterOption());
        shard2Client = new PrismaClient({
            adapter,
            log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        })
    }
    return shard2Client;
}

export function getPrismaClient(shardId: ShardId) {
    return shardId == ShardId.SHARD_1 ? getShard1Client() : getShard2Client();
}

export async function closePrismaClients(): Promise<void> {
    if (shard1Client) {
        await shard1Client.$disconnect();
        shard1Client = null;
        console.log("Shard 1 Client Disconnected");
    }

    if (shard2Client) {
        await shard2Client.$disconnect();
        shard2Client = null;
        console.log("Shard 1 Client Disconnected");
    }
}



