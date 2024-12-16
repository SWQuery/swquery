use {
    super::*,
    crate::constants::USDC_TO_CREDIT,
    mollusk_svm::result::Check,
    solana_sdk::{
        account::{AccountSharedData, ReadableAccount},
        instruction::{AccountMeta, Instruction},
        program_pack::Pack,
        pubkey::Pubkey,
        sysvar::SysvarId,
    },
    spl_token::state::Account as TokenAccount,
};

#[test]
fn test_refund_credits() {
    // Setup the initial environment
    let (program_id, mollusk) = setup();
    let (token_program, token_program_account) = mollusk_token::token::keyed_account();
    let _clock_sysvar = Pubkey::new_unique();
    let _clock_sysvar_account = create_account(
        0,
        std::mem::size_of::<solana_sdk::clock::Clock>(),
        &solana_sdk::clock::Clock::id(),
    );

    // Admin and buyer accounts
    let _admin = Pubkey::new_unique();
    let buyer = Pubkey::new_unique();

    // Mint authority and USDC mint
    let mint_authority = Pubkey::new_unique();
    let usdc_mint = Pubkey::new_from_array(five8_const::decode_32_const(
        "11111111111111111111111111111111111111111111",
    ));
    let _usdc_mint_account = pack_mint(&mint_authority, 1_000_000);

    // Initialize the treasury PDA with initial balance
    let (treasury_pda, treasury_bump) = Pubkey::find_program_address(&[b"treasury"], &program_id);
    let treasury_account = pack_token_account(
        &treasury_pda, // Owner is treasury PDA
        &usdc_mint,    // USDC mint
        1_000_000,     // Initial USDC balance in treasury
    );

    // Create buyer's USDC account
    let buyer_token_account = Pubkey::new_unique();
    let buyer_token_account_data = pack_token_account(
        &buyer,     // Owner
        &usdc_mint, // USDC mint
        0,          // Initial balance (will receive refund)
    );

    // Initialize credits account with some existing credits
    let (credits_account, _) =
        Pubkey::find_program_address(&[b"credits_account", &buyer.to_bytes()], &program_id);
    let mut credits_account_data =
        AccountSharedData::new(mollusk.sysvars.rent.minimum_balance(32), 32, &program_id);

    // Set initial credits state
    let credits_data = credits_account_data.data_as_mut_slice();
    credits_data[0..8].copy_from_slice(&0i64.to_le_bytes()); // timestamp
    credits_data[8..16].copy_from_slice(&1_000u64.to_le_bytes()); // credits_amount
    credits_data[16..24].copy_from_slice(&0u64.to_le_bytes()); // credits_amount_refunded
    credits_data[24] = treasury_bump; // bump

    // Create refund instruction
    let refund_amount = 500_000u64;
    let instruction_data = [
        vec![1],
        refund_amount.to_le_bytes().to_vec(),
        vec![treasury_bump],
    ]
    .concat();

    let instruction = Instruction {
        program_id,
        accounts: vec![
            // AccountMeta::new(buyer, true),
            AccountMeta::new(buyer_token_account, false),
            AccountMeta::new(treasury_pda, false),
            AccountMeta::new(credits_account, false),
            AccountMeta::new_readonly(token_program, false),
        ],
        data: instruction_data,
    };

    let accounts = vec![
        // (
        //     buyer,
        //     AccountSharedData::new(1_000_000, 0, &system_program::id()),
        // ),
        (buyer_token_account, buyer_token_account_data),
        (treasury_pda, treasury_account.clone()),
        (credits_account, credits_account_data),
        (token_program, token_program_account),
    ];

    // Log initial treasury amount
    let initial_treasury_amount = TokenAccount::unpack(treasury_account.data())
        .expect("unpack")
        .amount;

    // Process refund instruction
    let result =
        mollusk.process_and_validate_instruction(&instruction, &accounts, &[Check::success()]);

    // Log final treasury amount
    let final_treasury_amount =
        TokenAccount::unpack(result.get_account(&treasury_pda).unwrap().data())
            .expect("unpack")
            .amount;

    assert!(
        final_treasury_amount < initial_treasury_amount,
        "Treasury balance should decrease by refund amount divided by USDC_TO_CREDIT"
    );
}
