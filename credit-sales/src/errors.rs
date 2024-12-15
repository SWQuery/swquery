use pinocchio::program_error::ProgramError;

pub enum CreditSalesError {
    InvalidInstructionData,
    NotEnoughAccountKeys,
    UninitializedAccount,
    InvalidAccountData,
}

impl From<CreditSalesError> for ProgramError {
    fn from(e: CreditSalesError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
