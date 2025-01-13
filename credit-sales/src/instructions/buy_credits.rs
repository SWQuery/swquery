use {
    crate::{
        constants::{TREASURY, USDC_TO_CREDIT},
        errors::CreditSalesError,
    },
    pinocchio::{
        account_info::AccountInfo, program_error::ProgramError, pubkey::Pubkey, ProgramResult,
    },
    pinocchio_token::instructions::Transfer,
};

pub fn process_buy_credits_instruction(accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    if data.len() != 9 {
        return Err(ProgramError::InvalidInstructionData);
    }

    let [buyer, _buyer_ta, treasury, credits_account, _clock_sysvar, _token_program] = accounts
    else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    assert!(buyer.is_signer());

    if treasury.key() != &TREASURY {
        return Err(CreditSalesError::InvalidAccountData.into());
    }

    let amount_usdc = unsafe { *(data.as_ptr().add(0) as *const u64) };
    let bump = unsafe { *(data.as_ptr().add(8) as *const [u8; 1]) };

    Transfer {
        from: _buyer_ta,
        to: treasury,
        authority: buyer,
        amount: amount_usdc,
    }
    .invoke()?; // 5,949 CUs -  Can happen off of the instruction???

    let mut credits_account_data = credits_account.try_borrow_mut_data()?;
    let credits_account_ptr = credits_account_data.as_mut_ptr();
    unsafe {
        *(credits_account_ptr.add(0) as *mut i64) = 0; // timestamp
        *(credits_account_ptr.add(8) as *mut u64) = amount_usdc * USDC_TO_CREDIT; // credits_amount
        *(credits_account_ptr.add(16) as *mut u64) = 0; // credits_amount_refunded
        *(credits_account_ptr.add(24) as *mut [u8; 1]) = bump; // bump
        *(credits_account_ptr.add(25) as *mut Pubkey) = *buyer.key(); // owner
    }

    Ok(())
}
