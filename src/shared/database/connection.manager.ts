import { Prisma, PrismaClient } from "../../generated/prisma/client";
import { ShardId } from "../types/shared-types";
import { getPrismaClient } from "./prisma.client";

export class ConnectionManager {

    // get prima client for a specific shard for transactinal operation  // -> return client 
    // get prima connection pool for a specific shard for  (read-only operation)   // -> return pool 
    // make sharded schema on top of it
    // make relication 

    getClient(shardId: ShardId): PrismaClient {
        return getPrismaClient(shardId);
    }

    async executeInTransaction<T>(shardId: ShardId, fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
        const client = getPrismaClient(shardId);

        return await client.$transaction(fn, {
            isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead
        });
    }
}

//Repeatable Read: while we're inside a transaction, we're guaranteed to see the same data across all reads.


export const connectionManager = new ConnectionManager();
