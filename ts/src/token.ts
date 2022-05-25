import {
  PublicKey,
  Connection,
  TransactionInstruction,
  Transaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
} from '@solana/spl-token';
import { parseUnits } from '@ethersproject/units';
import { Wallet } from './wallet';

export type TokenInfo = {
  mintAddress: string;
  decimal: number;
};

export class SPLToken {
  private _mintAddress: string;
  private _connection: Connection;
  private _decimal: number;
  constructor(connection: Connection, tokenInfo: TokenInfo) {
    this._connection = connection;
    this._mintAddress = tokenInfo.mintAddress;
    this._decimal = tokenInfo.decimal;
  }

  async transfer(transferParams: any, wallet: Wallet): Promise<any> {
    const rawAmount = parseUnits(
      transferParams.amount,
      this._decimal
    ).toNumber();
    //
    const associatedAccountSender = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      new PublicKey(this._mintAddress),
      new PublicKey(transferParams.from)
    );

    const associatedAccountReceiver = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      new PublicKey(this._mintAddress),
      new PublicKey(transferParams.to)
    );

    const info = await this._connection.getParsedAccountInfo(
      associatedAccountReceiver
    );
    const associatedAcccountInstruction: TransactionInstruction[] = [];
    if (info.value == null) {
      // create account instructions
      associatedAcccountInstruction.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          new PublicKey(this._mintAddress),
          associatedAccountReceiver,
          new PublicKey(transferParams.to),
          new PublicKey(wallet.address)
        )
      );
    }
    // create transfer instruction

    const transferTokenRawInstruction = Token.createTransferCheckedInstruction(
      TOKEN_PROGRAM_ID,
      associatedAccountSender,
      new PublicKey(this._mintAddress),
      associatedAccountReceiver,
      wallet.publicKey,
      [],
      rawAmount,
      this._decimal
    );

    const instructions = [
      ...associatedAcccountInstruction,
      transferTokenRawInstruction,
    ];
    const tx = new Transaction().add(...instructions);
    const blockhash = await this._connection.getRecentBlockhash();
    tx.recentBlockhash = blockhash.blockhash;
    // sign transaction
    tx.sign(wallet.keyPair);
    //
    const signature = await this._connection.sendRawTransaction(tx.serialize());
    return signature;
  }
}
