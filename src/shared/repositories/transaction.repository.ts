import { PrismaClient } from "@prisma/client/extension";
import { $Enums, Prisma } from "../../generated/prisma/client";
import { Transaction } from "../types/shared-types.js"




type TransactionStatus = $Enums.TransactionStatus;
export class TransactionRepository {
    async create(from_user: bigint, to_user: bigint, amount: bigint, idempotency_key: string, tx: Prisma.TransactionClient) {
        const transactionEntity = await tx.transaction.create({
            data: {
                from_user: from_user,
                to_user: to_user,
                amount: amount,
                idempotency_key: idempotency_key,
                status: "PENDING"
            }
        })
        return this.mapToTransaction(transactionEntity);
    }

    async findById(transactionId: bigint, tx: Prisma.TransactionClient): Promise<Transaction | null> {
        const transactionEntity = await tx.transaction.findUnique({
            where: {
                id: transactionId
            }
        })
        return transactionEntity ? this.mapToTransaction(transactionEntity) : null;
    }

    async findByIdempotencyKey(idempotencyKey: string, tx: Prisma.TransactionClient): Promise<Transaction | null> {
        const transactionEntity = await tx.transaction.findUnique({
            where: {
                idempotency_key: idempotencyKey
            }
        })
        return transactionEntity ? this.mapToTransaction(transactionEntity) : null;
    }
    async updateStatus(transactionId: bigint, status: TransactionStatus, tx: Prisma.TransactionClient): Promise<Transaction> {
        const transactionEntity = await tx.transaction.update({
            where: {
                id: transactionId
            },
            data: {
                status: status
            }
        })
        return this.mapToTransaction(transactionEntity);
    }

    async getHistory(userId: bigint, client1: PrismaClient, client2: PrismaClient): Promise<Transaction[]> {
        const [txn1, txn2] = await Promise.all([
            client1.transaction.findMany({
                where: {
                    OR: [{ from_user: userId }, { to_user: userId }]
                },
                orderBy: {
                    created_at: 'desc'
                }
            })
            ,client2.transaction.findMany({
                where: {
                    OR: [{ from_user: userId }, { to_user: userId }]
                },
                orderBy: {
                    created_at: 'desc'
                }
            })
        ])

        return [...txn1 , ...txn2].sort((a,b)=>b.created_at.getTime()- a.created_at.getTime())
        .map((transactionEntity)=>this.mapToTransaction(transactionEntity))
    }
    private mapToTransaction(transactionEntity: {
        id: bigint;
        from_user: bigint;
        to_user: bigint;
        amount: bigint;
        status: TransactionStatus;
        idempotency_key: string;
        created_at: Date;
    }) {
        return {
            id: transactionEntity.id,
            fromUser: transactionEntity.from_user,
            toUser: transactionEntity.to_user,
            amount: transactionEntity.amount,
            status: transactionEntity.status,
            idempotencyKey: transactionEntity.idempotency_key,
            createdAt: transactionEntity.created_at,
        }
    }
}