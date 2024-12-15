use pinocchio::{
    account_info::AccountInfo, entrypoint, program_error::ProgramError, pubkey::Pubkey,
    ProgramResult,
};

mod instructions;
use instructions::*;
mod constants;
mod errors;
mod state;

#[cfg(test)]
mod tests;

pub const ID: [u8; 32] =
    five8_const::decode_32_const("99999999999999999999999999999999999999999999");
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    assert_eq!(program_id, &ID);

    let (instruction_discriminant, instruction_data) = instruction_data
        .split_first()
        .ok_or(ProgramError::InvalidInstructionData)?;

    let instruction = CreditSalesInstruction::try_from(instruction_discriminant)?;

    match instruction {
        instructions::CreditSalesInstruction::BuyCredits => {
            process_buy_credits_instruction(accounts, instruction_data)
        }
        instructions::CreditSalesInstruction::RefundCredits => {
            process_refund_credits_instruction(accounts, instruction_data)
        }
        instructions::CreditSalesInstruction::WithdrawUSDC => {
            process_withdraw_usdc_instruction(accounts, instruction_data)
        }
    }
}
