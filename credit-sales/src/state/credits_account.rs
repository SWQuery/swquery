use pinocchio::{account_info::AccountInfo, program_error::ProgramError, pubkey::Pubkey};

pub struct CreditsAccount(*mut u8);

impl CreditsAccount {
    pub const LEN: usize = 8  // timestamp
                         + 8  // credits_amount
                         + 8  // credits_amount_refunded
                         + 1; // bump

    #[inline(always)]
    pub fn from_account_info_unchecked(account_info: &AccountInfo) -> Self {
        unsafe { Self(account_info.borrow_mut_data_unchecked().as_mut_ptr()) }
    }

    #[inline(always)]
    pub fn from_account_info(account_info: &AccountInfo) -> Result<Self, ProgramError> {
        assert_eq!(*account_info.owner(), crate::ID);
        assert_eq!(account_info.data_len(), Self::LEN);
        Ok(Self::from_account_info_unchecked(account_info))
    }
}
