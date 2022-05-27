use anyhow::Result;
use solana_client::rpc_client::RpcClient;
use solana_sdk::{commitment_config::CommitmentConfig, pubkey::Pubkey};


use dotenv::dotenv;
use std::{
    env,
    str::FromStr,
    time::Duration
};
mod signatures; 
use signatures::get_signatures;

fn main() -> Result<()> {
    dotenv().ok();
    let rpc = env::var("RPC").unwrap();
    //
    let wallet = env::var("WALLET_ADDRESS").unwrap();
    let wallet_address = Pubkey::from_str(&wallet)?;
    let commitment = CommitmentConfig::from_str("confirmed")?;
    let timeout = Duration::from_secs(300);
    let client = RpcClient::new_with_timeout_and_commitment(rpc.clone(), timeout, commitment);

    get_signatures(&client, &wallet_address)?;
    Ok(())
}