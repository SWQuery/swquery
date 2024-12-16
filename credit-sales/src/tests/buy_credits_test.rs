use {
    super::*,
    crate::state::*,
    mollusk_svm::result::Check,
    solana_sdk::{
        account::{AccountSharedData, ReadableAccount},
        instruction::{AccountMeta, Instruction},
        program_pack::Pack,
        pubkey::Pubkey,
        system_program,
        sysvar::SysvarId,
    },
};

#[test]
fn test_buy_credits() {
    let (program_id, mollusk) = setup();
    let (token_program, token_program_account) = mollusk_token::token::keyed_account();
    let clock_sysvar = Pubkey::new_unique();
    let clock_sysvar_account = create_account(
        0,
        std::mem::size_of::<solana_sdk::clock::Clock>(),
        &solana_sdk::clock::Clock::id(),
    );

    let admin = Pubkey::new_unique();

    let mint_authority = Pubkey::new_unique();

    let usdc_mint = Pubkey::new_from_array(five8_const::decode_32_const(
        "111111111111111111111111111111111111111111",
    ));
    let usdc_mint_account = pack_mint(&mint_authority, 1_000_000);

    let buyer = Pubkey::new_unique();
    let buyer_token_account = Pubkey::new_unique();
    let buyer_token_account_data = pack_token_account(&buyer, &usdc_mint, 10u64);

    let (credits_account, _) =
        Pubkey::find_program_address(&[b"credits_account", &buyer.to_bytes()], &program_id);
    let credits_account_data = AccountSharedData::new(
        mollusk.sysvars.rent.minimum_balance(CreditsAccount::LEN),
        CreditsAccount::LEN,
        &program_id,
    );

    // Derive the treasury PDA
    let (treasury, bump) = Pubkey::find_program_address(&[b"treasury"], &program_id);
    let treasury_account = pack_token_account(
        &admin,     // owner
        &usdc_mint, // mint
        0,          // amount
    );

    let data = [
        vec![0],
        10u64.to_le_bytes().to_vec(),
        bump.to_le_bytes().to_vec(),
    ]
    .concat();

    let instruction = Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(buyer, true),
            AccountMeta::new(buyer_token_account, false),
            AccountMeta::new(treasury, false),
            AccountMeta::new(credits_account, false),
            AccountMeta::new(clock_sysvar, false),
            AccountMeta::new_readonly(token_program, false),
        ],
        data,
    };

    let accounts = vec![
        (
            buyer,
            AccountSharedData::new(
                1_000_000,
                spl_token::state::Account::LEN,
                &system_program::id(),
            ),
        ),
        (buyer_token_account, buyer_token_account_data),
        (treasury, treasury_account),
        (credits_account, credits_account_data),
        (clock_sysvar, clock_sysvar_account),
        (token_program, token_program_account),
    ];

    let result =
        mollusk.process_and_validate_instruction(&instruction, &accounts, &[Check::success()]);
    assert!(
        !result.program_result.is_err(),
        "Initialize fundraiser failed"
    );

    let credits_account = result.get_account(&credits_account).unwrap();
    let credits_account = credits_account.data();
    println!("credits_account: {:?}", credits_account);
    println!("CreditsAccount::LEN: {:?}", CreditsAccount::LEN);
    println!(
        "CreditsAccount::credits_amount: {:?}",
        u64::from_le_bytes(credits_account[8..16].try_into().unwrap())
    );
    println!(
        "CreditsAccount::amount_refunded: {:?}",
        u64::from_le_bytes(credits_account[16..24].try_into().unwrap())
    );
    println!("CreditsAccount::bump: {:?}", credits_account[24]);
}
