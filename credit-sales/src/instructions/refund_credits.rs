use crate::{
    constants::{TIME_TO_REFUND, TREASURY, USDC_MINT},
    state::CreditsAccount,
};
use pinocchio::{
    account_info::AccountInfo,
    instruction::{Seed, Signer},
    program_error::ProgramError,
    ProgramResult,
};
use pinocchio_token::{instructions::Transfer, state::TokenAccount};

pub fn process_refund_credits_instruction(accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    let [
        buyer,    // signer
        buyer_ta, // signer token account
        vault,     // vault to store the USDC
        credits_account  // 
    ] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };

    let amount = unsafe { data.as_ptr().add(0) as u64 }; // 8 bytes
    let bump = unsafe { std::ptr::read(data.as_ptr().add(8) as *const [u8; 1]) }; // 1 byte

    let buyer_ta_account = TokenAccount::from_account_info(buyer_ta)?;
    assert_eq!(buyer_ta_account.mint(), &USDC_MINT); // Security: buyer_ta is a USDC account
    assert_eq!(vault.key(), &TREASURY); // Security: vault is the treasury

    let seeds = [
        Seed::from(credits_account.key().as_ref()),
        Seed::from(&bump),
    ];
    let signer = [Signer::from(&seeds)];

    // Security:
    // buyer is signer
    // if buyer_ta mint differs from USDC_MINT, then buyer_ta is not a USDC account, thus the transfer will fail (no need to check)
    Transfer {
        from: vault,
        to: buyer_ta,
        authority: buyer,
        amount,
    }
    .invoke_signed(&signer)?;

    Ok(())
}
