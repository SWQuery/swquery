use {
    crate::constants::USDC_TO_CREDIT,
    pinocchio::{
        account_info::AccountInfo,
        instruction::{Seed, Signer},
        program_error::ProgramError,
        ProgramResult,
    },
    pinocchio_token::instructions::Transfer,
};

pub fn process_refund_credits_instruction(accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    if data.len() != 9 {
        return Err(ProgramError::InvalidInstructionData);
    }

    let [buyer_ta, vault, credits_account, _token_program] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };

    let amount_of_credits = unsafe { data.as_ptr().add(0) as u64 }; // 8 bytes
    let bump = unsafe { std::ptr::read(data.as_ptr().add(8) as *const [u8; 1]) }; // 1 byte

    let seeds = [Seed::from(b"treasury"), Seed::from(&bump)];
    let signer = [Signer::from(&seeds)];

    Transfer {
        from: vault,
        to: buyer_ta,
        authority: vault,
        amount: amount_of_credits / USDC_TO_CREDIT,
    }
    .invoke_signed(&signer)?;

    unsafe {
        *(credits_account
            .borrow_mut_data_unchecked()
            .as_mut_ptr()
            .add(16) as *mut u64) += amount_of_credits; // credits_amount_refunded
    }

    Ok(())
}
