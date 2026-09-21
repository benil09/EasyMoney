import { shardId } from "../types/shared-types.js";

export class shardResolver {


    static getShardId(userId: bigint | number): shardId {
        return Number(userId) % 2 === 0 ? shardId.SHARD_1 : shardId.SHARD_2;
    }

    static getShardName(userId: bigint | number): string {
        const ShardId = this.getShardId(userId)
        return ShardId == shardId.SHARD_1 ? 'shard_1' : 'shard_2';
    }
    static areOnSameShard(userId1: bigint | number, userId2: bigint | number): boolean {
        return this.getShardId(userId1) === this.getShardId(userId2);
    }


}