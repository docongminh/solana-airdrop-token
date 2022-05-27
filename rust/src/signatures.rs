use anyhow::{Result, Ok};
use serde_json;
use solana_sdk::{commitment_config::CommitmentConfig, pubkey::Pubkey, signature::Signature};
use solana_client::rpc_client::{RpcClient, GetConfirmedSignaturesForAddress2Config};

use std::{
  str::FromStr
};

pub fn get_signatures(client: &RpcClient, wallet_address: &Pubkey) -> Result<()>{
  let mut all_signatures = Vec::new();
  let mut signatures = client.get_signatures_for_address(&wallet_address)?;
  while signatures.len() > 0 {
    let last_sig = Signature::from_str(&signatures[signatures.len()-1].signature)?;
    all_signatures.append(&mut signatures);
    let config = GetConfirmedSignaturesForAddress2Config {
      before: Some(last_sig),
      until: None,
      limit: None,
      commitment: Some(CommitmentConfig::confirmed()),
    };
    signatures = client.get_signatures_for_address_with_config(&wallet_address, config)?;
  };
  println!("Found {} signatures", all_signatures.len());
  let mut file = std::fs::File::create(format!("signatures_{}.json", all_signatures.len()))?;
  serde_json::to_writer(&mut file, &all_signatures)?;
  Ok(())
}