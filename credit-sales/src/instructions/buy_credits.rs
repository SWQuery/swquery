use {
    crate::{
        constants::{TREASURY, USDC_MINT, USDC_TO_CREDIT},
        errors::CreditSalesError,
    },
    pinocchio::{account_info::AccountInfo, msg, program_error::ProgramError, ProgramResult},
    pinocchio_token::{instructions::Transfer, state::TokenAccount},
    std::convert::TryInto,
};

pub fn process_buy_credits_instruction(accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    msg!("Starting process_buy_credits_instruction");

    let [
        buyer,          // signer
        buyer_ta,       // signer token account
        treasury,       // vault to store the USDC
        credits_account,// credits account
        _clock_sysvar,  // clock sysvar
        _token_program,  // token program
    ] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };

    if data.len() != 9 {
        return Err(ProgramError::InvalidInstructionData);
    }

    let amount_usdc = u64::from_le_bytes(data[0..8].try_into().unwrap()); // 0-8 bytes
    msg!("amount_usdc ");
    let bump = data[8]; // 8-9 bytes
    msg!("bump");

    {
        let buyer_ta_account = TokenAccount::from_account_info(buyer_ta)?;
        if !buyer_ta_account.is_initialized() {
            return Err(CreditSalesError::UninitializedAccount.into());
        }
        if buyer_ta_account.mint() != &USDC_MINT {
            return Err(CreditSalesError::InvalidAccountData.into());
        }
    }

    {
        let treasury_account = TokenAccount::from_account_info(treasury)?;
        if !treasury_account.is_initialized() {
            return Err(CreditSalesError::UninitializedAccount.into());
        }
        if treasury_account.mint() != &USDC_MINT {
            return Err(CreditSalesError::InvalidAccountData.into());
        }
    } // treasury_account borrow ends here

    if treasury.key() != &TREASURY {
        return Err(CreditSalesError::InvalidAccountData.into());
    }

    Transfer {
        from: buyer_ta,
        to: treasury,
        authority: buyer,
        amount: amount_usdc,
    }
    .invoke()?;

    let mut credits_account_data = credits_account.try_borrow_mut_data()?;
    let credits_account_ptr = credits_account_data.as_mut_ptr();
    unsafe {
        *(credits_account_ptr.add(0) as *mut i64) = 0; // timestamp
        *(credits_account_ptr.add(8) as *mut u64) = amount_usdc * USDC_TO_CREDIT; // credits_amount
        *(credits_account_ptr.add(16) as *mut u64) = 0; // credits_amount_refunded
        *(credits_account_ptr.add(24)) = bump; // bump
    }

    Ok(())
}
