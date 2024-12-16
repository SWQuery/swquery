pub mod buy_credits;
pub use buy_credits::process_buy_credits_instruction;
pub mod refund_credits;
pub use refund_credits::process_refund_credits_instruction;
pub mod withdraw_usdc;
use pinocchio::program_error::ProgramError;
pub use withdraw_usdc::process_withdraw_usdc_instruction;

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
