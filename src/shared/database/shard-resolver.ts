import { ShardId } from "../types/shared-types.js";

export class shardResolver {


    static getShardId(userId: bigint | number): ShardId {
        return Number(userId) % 2 === 0 ? ShardId.SHARD_1 : ShardId.SHARD_2;
    }

    static getShardName(userId: bigint | number): string {
        const shard = this.getShardId(userId)
        return shard == ShardId.SHARD_1 ? 'shard_1' : 'shard_2';
    }
    static areOnSameShard(userId1: bigint | number, userId2: bigint | number): boolean {
        return this.getShardId(userId1) === this.getShardId(userId2);
    }


}