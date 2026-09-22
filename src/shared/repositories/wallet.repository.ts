import { Wallet } from "../types/shared-types.js";
import { Prisma } from "../../generated/prisma/client.js";

// ! handles all the db operations for wallets using prisma
// ! row locking -> via prisma transaction
// ! optimistic locking -> version column

export class WalletRepository {
    async create(userId: bigint, tx: Prisma.TransactionClient): Promise<Wallet> {
        const walletEntity = await tx.wallet.create({
            data: {
                user_id: userId,
                balance: BigInt(0),
                version: 0,
            }
        });
        return this.mapToWallet(walletEntity)
    }

    async findByUserId(userId: bigint, tx: Prisma.TransactionClient): Promise<Wallet | null> {
        const walletEntity = await tx.wallet.findUnique({
            where: {
                user_id: userId,
            },
        })
        return walletEntity ? this.mapToWallet(walletEntity) : null;
    }

    // find the user with userId with row level lock(SELECT FOR UPDATE)
    // prevent concurrent updates
    // if not found return null
    async findByUserIdWithLock(userId: bigint, tx: Prisma.TransactionClient): Promise<Wallet | null> {
        const result = await tx.$queryRaw<Array<{
            id: bigint,
            user_id: bigint,
            balance: bigint,
            version: number,
            created_at: Date,
            updated_at: Date,
        }>>`SELECT * FROM wallets WHERE user_id = ${userId} FOR UPDATE`;
        if (result.length === 0) return null;
        return this.mapToWallet(result[0]);
    }

    async updateBalance(walletId: bigint, newBalance: bigint, expectedVersion: number, tx: Prisma.TransactionClient): Promise<Wallet | null> {
        const result = await tx.wallet.updateMany({
            where: {
                version: expectedVersion
            },
            data: {
                balance: newBalance,
                version: { increment: 1 }

            }
        })
        if (result.count === 0) {
            return null;
        }
        return this.findByUserId(walletId, tx);
    }


    async debit(walletId: bigint, amount: bigint, tx: Prisma.TransactionClient): Promise<Wallet | null> {
        const wallet = await this.findByUserIdWithLock(walletId, tx);
        if (!wallet) {
            return null;
        }

        if (wallet.balance < amount) {
            return null;
        }

        const result = await tx.wallet.updateMany({
            where: {
                id: walletId,
                balance: {
                    gte: amount
                }
            },
            data: {
                balance: { decrement: amount }
            }
        })
        if (result.count === 0) {
            return null;
        }
        return this.findByUserId(walletId, tx);
    }

    async credit(userId: bigint, walletId: bigint, amount: bigint, tx: Prisma.TransactionClient): Promise<Wallet | null> {

        const wallet = await this.findByUserIdWithLock(walletId, tx);
        if (!wallet) {
            await this.create(userId, tx);
        }

        const creditWallet = await this.findByUserIdWithLock(userId, tx);
        if (!creditWallet) {
            throw new Error('Wallet not found');
        }
        const newBalance = creditWallet.balance + amount;
        return await this.updateBalance(creditWallet.walletId, newBalance, creditWallet.version, tx);
    }

    private mapToWallet(walletEntity: { id: bigint, user_id: bigint, balance: bigint, version: number, created_at: Date, updated_at: Date }): Wallet {
        return {
            walletId: BigInt(walletEntity.id.toString()),
            userId: BigInt(walletEntity.user_id.toString()),
            balance: BigInt(walletEntity.balance.toString()),
            version: walletEntity.version,
            createdAt: walletEntity.created_at,
            updatedAt: walletEntity.updated_at,
        }
    }
}

