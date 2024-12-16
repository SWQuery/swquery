use {
    crate::{constants::USDC_TO_CREDIT, state::CreditsAccount},
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

    let [admin, buyer, buyer_ta, treasury, credits_account, _token_program] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    assert!(admin.is_signer());

    let credits_account_data = CreditsAccount::from_account_info(credits_account)?;
    assert_eq!(buyer.key(), &credits_account_data.owner(),);

    let amount_of_credits = unsafe { *(data.as_ptr().add(0) as *const u64) }; // 8 bytes
    let bump = unsafe { *(data.as_ptr().add(8)) }; // 1 byte

    let binding = [bump];
    let seeds = [
        Seed::from(b"treasury"),
        Seed::from(admin.key()),
        Seed::from(&binding[..]),
    ];
    let signer = [Signer::from(&seeds)];

    Transfer {
        from: treasury,
        to: buyer_ta,
        authority: treasury,
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
