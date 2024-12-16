mod buy_credits_test;
mod refund_credits_test;
mod withdraw_usdc_test;

use {
    mollusk_svm::Mollusk,
    solana_sdk::{
        account::{AccountSharedData, WritableAccount},
        program_option::COption,
        program_pack::Pack,
        pubkey::Pubkey,
    },
    spl_token::state::AccountState,
};

fn setup() -> (Pubkey, Mollusk) {
    let program_id = Pubkey::new_from_array(five8_const::decode_32_const(
        "99999999999999999999999999999999999999999999",
    ));
    let mut mollusk = Mollusk::new(&program_id, "../target/deploy/credit_sales");
    mollusk_token::token::add_program(&mut mollusk);

    (program_id, mollusk)
}

pub fn create_account(lamports: u64, data_len: usize, owner: &Pubkey) -> AccountSharedData {
    AccountSharedData::new(lamports, data_len, owner)
}

pub fn pack_mint(mint_authority: &Pubkey, supply: u64) -> AccountSharedData {
    let mut account = create_account(0, spl_token::state::Mint::LEN, &spl_token::id());
    spl_token::state::Mint {
        mint_authority: COption::Some(*mint_authority),
        supply,
        decimals: 9,
        is_initialized: true,
        freeze_authority: COption::None,
    }
    .pack_into_slice(account.data_as_mut_slice());
    account
}

pub fn pack_token_account(authority: &Pubkey, mint: &Pubkey, amount: u64) -> AccountSharedData {
    let mut account = create_account(0, spl_token::state::Account::LEN, &spl_token::id());
    spl_token::state::Account {
        mint: *mint,
        owner: *authority,
        amount,
        delegate: COption::None,
        state: AccountState::Initialized,
        is_native: COption::None,
        delegated_amount: 0,
        close_authority: COption::None,
    }
    .pack_into_slice(account.data_as_mut_slice());
    account
}
