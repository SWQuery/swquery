use pinocchio::{account_info::AccountInfo, program_error::ProgramError};

pub struct CreditsAccount(*mut u8);

impl CreditsAccount {
    pub const LEN: usize = 8  // timestamp i64
                         + 8  // credits_amount u64
                         + 8  // credits_amount_refunded u64
                         + 1; // bump [u8; 1]

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

    #[inline(always)]
    pub fn bump(&self) -> [u8; 1] {
        unsafe { [*self.0.add(24)] }
    }

    #[inline(always)]
    pub fn credits_amount_refunded(&self) -> u64 {
        unsafe { *(self.0.add(16) as *const u64) }
    }

    #[inline(always)]
    pub fn add_refunded_amount(&self, amount: u64) {
        unsafe { *(self.0.add(16) as *mut u64) += amount }
    }
}
