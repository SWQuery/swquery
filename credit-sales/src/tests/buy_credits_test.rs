use {
    super::*,
    crate::{constants::USDC_TO_CREDIT, state::*},
    mollusk_svm::result::Check,
    solana_sdk::{
        account::{AccountSharedData, ReadableAccount},
        instruction::{AccountMeta, Instruction},
        program_pack::Pack,
        pubkey::Pubkey,
        system_program,
        sysvar::SysvarId,
    },
    spl_token::state::Account as TokenAccount,
};

#[test]
fn test_buy_credits() {
    // ========= Setup test environment =========
    let (program_id, mollusk) = setup();
    let (token_program, token_program_account) = mollusk_token::token::keyed_account();

    // Setup clock sysvar
    let clock_sysvar = Pubkey::new_unique();
    let clock_sysvar_account = create_account(
        0,
        std::mem::size_of::<solana_sdk::clock::Clock>(),
        &solana_sdk::clock::Clock::id(),
    );

    // ========= Setup accounts =========
    let admin = Pubkey::new_from_array(five8_const::decode_32_const(
        "3n5KbkZv1Zyu661dTzPNCqKzLyeYu9uuaqLExpLnz3w4",
    ));
    let usdc_mint = Pubkey::new_from_array(five8_const::decode_32_const(
        "111111111111111111111111111111111111111111",
    ));

    // Setup buyer accounts
    let buyer = Pubkey::new_unique();
    let initial_buyer_balance = 10u64;
    let buyer_token_account = Pubkey::new_unique();
    let buyer_token_account_data = pack_token_account(&buyer, &usdc_mint, initial_buyer_balance);

    // Verify initial buyer balance
    let initial_buyer_ta_balance = TokenAccount::unpack(buyer_token_account_data.data())
        .expect("Failed to unpack buyer token account")
        .amount;
    assert_eq!(
        initial_buyer_ta_balance, initial_buyer_balance,
        "Initial buyer balance mismatch"
    );

    // Setup credits account
    let (credits_account, _) =
        Pubkey::find_program_address(&[b"credits_account", &buyer.to_bytes()], &program_id);
    let credits_account_data = AccountSharedData::new(
        mollusk.sysvars.rent.minimum_balance(CreditsAccount::LEN),
        CreditsAccount::LEN,
        &program_id,
    );

    // Setup treasury
    let (treasury, bump) =
        Pubkey::find_program_address(&[b"treasury", &admin.to_bytes()], &program_id);
    let treasury_account = pack_token_account(&admin, &usdc_mint, 0);

    // Verify initial treasury balance
    let initial_treasury_balance = TokenAccount::unpack(treasury_account.data())
        .expect("Failed to unpack treasury account")
        .amount;
    assert_eq!(
        initial_treasury_balance, 0,
        "Initial treasury balance should be 0"
    );

    // ========= Create instruction =========
    let amount_to_transfer = 10u64;
    let instruction_data = [
        vec![0],
        amount_to_transfer.to_le_bytes().to_vec(),
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
        data: instruction_data,
    };

    let transfer_instruction = spl_token::instruction::transfer(
        &token_program,
        &buyer_token_account,
        &treasury,
        &buyer,
        &[],
        amount_to_transfer,
    )
    .unwrap();

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

    // ========= Execute instruction =========
    let result = mollusk.process_and_validate_instruction_chain(
        &[instruction, transfer_instruction],
        &accounts,
        &[Check::success()],
    );
    assert!(
        !result.program_result.is_err(),
        "Buy credits instruction failed"
    );

    // ========= Validate results =========
    // Verify credits account state
    let credits_account_data = result
        .get_account(&credits_account)
        .expect("Failed to get credits account")
        .data();

    let credits_amount = u64::from_le_bytes(credits_account_data[8..16].try_into().unwrap());
    let amount_refunded = u64::from_le_bytes(credits_account_data[16..24].try_into().unwrap());
    let credits_bump = credits_account_data[24];

    assert_eq!(
        credits_amount,
        amount_to_transfer * USDC_TO_CREDIT,
        "Credits amount should equal transferred amount"
    );
    assert_eq!(
        amount_refunded, 0,
        "Amount refunded should be 0 after transfer"
    );
    assert_eq!(credits_bump, bump, "Bump should match");
    assert_eq!(
        credits_account_data[0..8],
        [0u8; 8],
        "Timestamp should be 0 after transfer"
    );

    // Verify final balances
    let final_buyer_balance = TokenAccount::unpack(
        result
            .get_account(&buyer_token_account)
            .expect("Failed to get buyer account")
            .data(),
    )
    .expect("Failed to unpack buyer account")
    .amount;

    let final_treasury_balance = TokenAccount::unpack(
        result
            .get_account(&treasury)
            .expect("Failed to get treasury account")
            .data(),
    )
    .expect("Failed to unpack treasury account")
    .amount;

    // Assert final states
    assert_eq!(
        final_buyer_balance, 0,
        "Buyer balance should be 0 after transfer"
    );
    assert_eq!(
        final_treasury_balance, amount_to_transfer,
        "Treasury balance should equal transferred amount"
    );
}
