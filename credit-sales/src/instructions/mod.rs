pub mod buy_credits;
pub use buy_credits::process_buy_credits_instruction;
pub mod refund_credits;
use pinocchio_token::instructions::Transfer;
pub use refund_credits::process_refund_credits_instruction;

use pinocchio::{
    account_info::AccountInfo,
    instruction::{Seed, Signer},
    msg,
    program_error::ProgramError,
    ProgramResult,
};

use crate::{
    constants::{TREASURY, USDC_MINT},
    errors::CreditSalesError,
};

#[derive(Clone, Copy, Debug)]
pub enum CreditSalesInstruction {
    BuyCredits = 0,
    RefundCredits = 1,
    WithdrawUSDC = 2,
}

impl TryFrom<&u8> for CreditSalesInstruction {
    type Error = ProgramError;

    fn try_from(value: &u8) -> Result<Self, ProgramError> {
        match value {
            0 => Ok(Self::BuyCredits),
            1 => Ok(Self::RefundCredits),
            2 => Ok(Self::WithdrawUSDC),
            _ => Err(ProgramError::InvalidInstructionData),
        }
    }
}

pub fn process_withdraw_usdc_instruction(accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    if data.len() != 9 {
        return Err(ProgramError::InvalidInstructionData);
    }

    let amount = u64::from_le_bytes(data[0..8].try_into().unwrap());
    msg!("amount ");
    let bump = data[8];
    msg!("bump");

    let [treasury_account, admin_usdc_account, _admin_account, _token_program] = accounts else {
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

    msg!("WithdrawUSDC instruction completed successfully");

    msg!("WithdrawUSDC instruction completed successfully");

    Ok(())
}
