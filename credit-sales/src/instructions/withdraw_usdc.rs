use {
    pinocchio::{
        account_info::AccountInfo,
        instruction::{Seed, Signer},
        program_error::ProgramError,
        ProgramResult,
    },
    pinocchio_token::instructions::Transfer,
};

pub fn process_withdraw_usdc_instruction(accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    if data.len() != 9 {
        return Err(ProgramError::InvalidInstructionData);
    }

    let amount = unsafe { *(data.as_ptr().add(0) as *const u64) };
    let bump = unsafe { *(data.as_ptr().add(8)) };

    let [treasury_account, admin_usdc_account, _token_program] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };

    let binding = [bump];
    let seeds = [Seed::from(b"treasury"), Seed::from(&binding)];
    let signer = [Signer::from(&seeds)];

    let transfer_instruction = Transfer {
        from: treasury_account,
        to: admin_usdc_account,
        authority: treasury_account,
        amount,
    };
    transfer_instruction.invoke_signed(&signer)?;

    Ok(())
}
