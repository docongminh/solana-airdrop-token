import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';

export class Wallet {
  private _wallet: Keypair;
  constructor(wallet: Keypair) {
    this._wallet = wallet;
  }

  get address(): string {
    return this._wallet.publicKey.toString();
  }

  static newWallet(): Wallet {
    const keypair = Keypair.generate();
    return new Wallet(keypair);
  }

  static async fromMnemonic(
    mnemonic: string,
    delivePath = "m/44'/501'/0'/0'"
  ): Promise<Wallet> {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid seed phrase');
    }
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const delivedSeed = derivePath(delivePath, seed.toString('hex')).key;
    const keypair = Keypair.fromSeed(delivedSeed as Uint8Array);
    return new Wallet(keypair);
  }

  static fromSecretKey(secretKey: Uint8Array): Wallet {
    const keypair = Keypair.fromSecretKey(secretKey);

    return new Wallet(keypair);
  }

  static fromStringSecretKey(secretKey: string): Wallet {
    const toBase58 = bs58.decode(secretKey);
    const keypair = Keypair.fromSecretKey(toBase58);

    return new Wallet(keypair);
  }
}
