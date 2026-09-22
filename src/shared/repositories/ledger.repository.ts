// # Prisma findUnique , create , update etc
// # Map Prisma entities to domain objects
// # No HTTP status code , no req/res object , req/res will be in controller layer


import { $Enums, Prisma } from "../../generated/prisma/client";
import { LedgerEntry } from "../../shared/types/shared-types.js"

// Handles all db entry using prisma itself
// Ledger provide an audit trail for all the transactions 
// Each ledger entry is sotred on users shard
// No replica db used for ledger db - because we are only appending data into the ledger db
type ledgerType = $Enums.LedgerType
export class LedgerRepository {
    async create(
        userId: bigint,
        transactionId: bigint,
        amount: bigint,
        type: ledgerType,
        tx: Prisma.TransactionClient
    ): Promise<LedgerEntry> {
        const ledgerEntity = await tx.ledger.create({
            data: {
                user_id: userId,
                transaction_id: transactionId,
                amount: amount,
                type: type,
            },
        });
        return this.mapToLedgerEntry(ledgerEntity);

    }

    async findLedgerById( ledgerId: bigint,tx: Prisma.TransactionClient ):Promise<LedgerEntry | null>{
        const ledgerEntity = await tx.ledger.findUnique({
            where: {
                id: ledgerId,
            },
        });
        return ledgerEntity ? this.mapToLedgerEntry(ledgerEntity) : null;

    }
    async getHistory(userId:bigint,limit:number,offset:number ,tx:Prisma.TransactionClient){
        const ledgerEntity = await tx.ledger.findMany({
            where:{
                user_id:userId,
            },
            take:limit,
            skip:offset,
            orderBy:{
                created_at:'desc'
            }
        })
        return ledgerEntity.map((ledgerEntity)=>this.mapToLedgerEntry(ledgerEntity));

    }
    private mapToLedgerEntry(ledgerEntity: {
        id: bigint;
        user_id: bigint;
        transaction_id: bigint;
        amount: bigint;
        type: string;
        created_at: Date;
    }): LedgerEntry {
        return {
            id: ledgerEntity.id,
            userId: ledgerEntity.user_id,
            transactionId: ledgerEntity.transaction_id,
            amount: ledgerEntity.amount,
            type: ledgerEntity.type as ledgerType,
            createdAt: ledgerEntity.created_at,
        };
    }

}