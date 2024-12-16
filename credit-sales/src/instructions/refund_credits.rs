use {
    crate::{
        constants::{TREASURY, USDC_MINT},
        state::CreditsAccount,
    },
    pinocchio::{
        account_info::AccountInfo,
        instruction::{Seed, Signer},
        program_error::ProgramError,
        ProgramResult,
    },
    pinocchio_token::{instructions::Transfer, state::TokenAccount},
};

pub fn process_refund_credits_instruction(accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    let [
        buyer, // signer
        buyer_ta, // signer token account
        vault, // vault to store the USDC
        credits_account // credits account to refund 
    ] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };

    let amount = unsafe { data.as_ptr().add(0) as u64 }; // 8 bytes
    let bump = unsafe { std::ptr::read(data.as_ptr().add(8) as *const [u8; 1]) }; // 1 byte

    let buyer_ta_account = TokenAccount::from_account_info(buyer_ta)?;
    assert_eq!(buyer_ta_account.mint(), &USDC_MINT); // Security: buyer_ta is a USDC account
    assert_eq!(vault.key(), &TREASURY); // Security: vault is the treasury

    let bump = CreditsAccount::from_account_info(credits_account)?.bump();
    let seeds = [
        Seed::from(credits_account.key().as_ref()),
        Seed::from(&bump),
    ];
    let signer = [Signer::from(&seeds)];

    // Security:
    // buyer is signer
    // if buyer_ta mint differs from USDC_MINT, then buyer_ta is not a USDC account,
    // thus the transfer will fail (no need to check)
    Transfer {
        from: vault,
        to: buyer_ta,
        authority: buyer,
        amount,
    }
    .invoke_signed(&signer)?;

    let mut credits_account_data = credits_account.try_borrow_mut_data()?;
    let credits_account_ptr = credits_account_data.as_mut_ptr();
    unsafe {
        *(credits_account_ptr.add(16) as *mut u64) += amount; // credits_amount_refunded
    }

    Ok(())
}
