// import { PrismaClient } from '../../generated/prisma/client.js';

import { $Enums } from "../../generated/prisma/client";

export enum ShardId {
    SHARD_1 = "shard1",
    SHARD_2 = "shard2"
}

// The tx inside $transaction is PrismaClient minus lifecycle methods.
// We hardcode the omitted keys since Prisma.TransactionClient loses model accessors.
// export type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;


export interface Wallet {
    walletId: bigint;
    userId: bigint;
    balance: bigint;
    version: number;
    createdAt: Date;
    updatedAt: Date;

}

// export enum LedgerType{
//     DEBIT = 'DEBIT',
//     CREDIT = 'CREDIT'
// }

export interface LedgerEntry {
    id: bigint;
    userId: bigint;
    transactionId: bigint;
    amount: bigint;
    type: $Enums.LedgerType;
    createdAt: Date;
}