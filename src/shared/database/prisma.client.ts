import { PrismaClient } from '../../generated/prisma/client';
import {PrismaMariaDb} from '@prisma/adapter-mariadb';
import { shardId } from '../types/shared-types';

// # Create a separate prisma client for each shard using the driver adapter
// # each connection manages its own connection pool using maria DB
// # so instead of using prisma pool we will use maria db pool
// # if there are many shards it will create many clients so to handle this use map
// # map of shardId to its prisma client


const shard1Client:PrismaClient| null = null;
const shard2Client:PrismaClient| null = null;

export function getShard1AdapterOption(){
    
}
export function getShard2AdapterOption(){

}

export function getShard1Client (){
    
}
export function getShard2Client (){
    
}




