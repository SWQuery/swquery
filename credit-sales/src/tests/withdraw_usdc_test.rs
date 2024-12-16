use {
    super::*,
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
fn test_withdraw_usdc() {
    // Setup the initial environment
    let (program_id, mollusk) = setup();
    let (token_program, token_program_account) = mollusk_token::token::keyed_account();
    let clock_sysvar = Pubkey::new_unique();
    let clock_sysvar_account = create_account(
        0,
        std::mem::size_of::<solana_sdk::clock::Clock>(),
        &solana_sdk::clock::Clock::id(),
    );

    // Admin and buyer accounts
    let admin = Pubkey::new_unique();
    let buyer = Pubkey::new_unique();

    // Mint authority and USDC mint
    let mint_authority = Pubkey::new_unique();
    let usdc_mint = Pubkey::new_from_array(five8_const::decode_32_const(
        "11111111111111111111111111111111111111111111",
    ));
    let usdc_mint_account = pack_mint(&mint_authority, 1_000_000);

    // Initialize the treasury PDA
    let (treasury_pda, treasury_bump) = Pubkey::find_program_address(&[b"treasury"], &program_id);
    let treasury_account = pack_token_account(
        &treasury_pda, // owner is treasury PDA itself
        &usdc_mint,    // USDC mint
        0,             // Initial amount
    );

    // Buyer's token account with initial USDC balance
    let buyer_token_account = Pubkey::new_unique();
    let buyer_token_account_data = pack_token_account(
        &buyer,     // owner
        &usdc_mint, // mint
        1_000_000,  // initial amount in buyer's account
    );

    // Credits account PDA for the buyer
    let (credits_account_pubkey, _) =
        Pubkey::find_program_address(&[b"credits_account", &buyer.to_bytes()], &program_id);
    let credits_account_data =
        AccountSharedData::new(mollusk.sysvars.rent.minimum_balance(32), 32, &program_id);

    // Prepare data for the BuyCredits instruction
    let amount_usdc = 500_000u64;
    let buy_instruction_data = [
        vec![0],                            // Instruction discriminant for BuyCredits
        amount_usdc.to_le_bytes().to_vec(), // amount_usdc
        vec![treasury_bump],                // bump
    ]
    .concat();

    // Create the BuyCredits instruction
    let buy_instruction = Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(buyer, true),
            AccountMeta::new(buyer_token_account, false),
            AccountMeta::new(treasury_pda, false),
            AccountMeta::new(credits_account_pubkey, false),
            AccountMeta::new(clock_sysvar, false),
            AccountMeta::new_readonly(token_program, false),
        ],
        data: buy_instruction_data,
    };

    // Prepare accounts for the BuyCredits instruction
    let mut accounts = vec![
        (
            buyer,
            AccountSharedData::new(1_000_000, 0, &system_program::id()),
        ),
        (buyer_token_account, buyer_token_account_data),
        (treasury_pda, treasury_account.clone()),
        (credits_account_pubkey, credits_account_data),
        (clock_sysvar, clock_sysvar_account.clone()),
        (token_program, token_program_account.clone()),
        (usdc_mint, usdc_mint_account.clone()),
    ];

    // Process the BuyCredits instruction
    let buy_result =
        mollusk.process_and_validate_instruction(&buy_instruction, &accounts, &[Check::success()]);

    // Update accounts with the results from the BuyCredits instruction
    accounts = vec![
        (buyer, buy_result.get_account(&buyer).unwrap().clone()),
        (
            buyer_token_account,
            buy_result
                .get_account(&buyer_token_account)
                .unwrap()
                .clone(),
        ),
        (
            treasury_pda,
            buy_result.get_account(&treasury_pda).unwrap().clone(),
        ),
        (
            credits_account_pubkey,
            buy_result
                .get_account(&credits_account_pubkey)
                .unwrap()
                .clone(),
        ),
        (clock_sysvar, clock_sysvar_account.clone()),
        (token_program, token_program_account.clone()),
        (usdc_mint, usdc_mint_account.clone()),
    ];

    // Admin's USDC token account
    let admin_usdc = Pubkey::new_unique();
    let admin_usdc_account = pack_token_account(
        &admin,     // owner
        &usdc_mint, // mint
        0,          // initial amount
    );

    // Prepare data for the WithdrawUSDC instruction
    let withdraw_amount = amount_usdc; // Withdraw the amount received from buyer
    let withdraw_instruction_data = [
        vec![2],                                // Instruction discriminant for WithdrawUSDC
        withdraw_amount.to_le_bytes().to_vec(), // amount to withdraw
        vec![treasury_bump],                    // bump
    ]
    .concat();

    // Create the WithdrawUSDC instruction
    let withdraw_instruction = Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(treasury_pda, false), // Treasury account
            AccountMeta::new(admin_usdc, false),   // Admin's USDC account
            AccountMeta::new(admin, true),         // Admin (signer)
            AccountMeta::new_readonly(token_program, false), // Token program
        ],
        data: withdraw_instruction_data,
    };

    // Add admin and admin_usdc accounts
    accounts.push((
        admin,
        AccountSharedData::new(1_000_000, 0, &system_program::id()),
    ));
    accounts.push((admin_usdc, admin_usdc_account));

    // Process the WithdrawUSDC instruction
    let withdraw_result = mollusk.process_and_validate_instruction(
        &withdraw_instruction,
        &accounts,
        &[Check::success()],
    );

    // Retrieve updated accounts
    let final_treasury = withdraw_result.get_account(&treasury_pda).unwrap();
    let final_admin_usdc = withdraw_result.get_account(&admin_usdc).unwrap();

    // Deserialize token accounts
    let treasury_token_account = spl_token::state::Account::unpack(final_treasury.data()).unwrap();
    let admin_token_account = spl_token::state::Account::unpack(final_admin_usdc.data()).unwrap();

    // Verify balances after withdrawal
    assert_eq!(
        treasury_token_account.amount, 0,
        "Treasury balance incorrect after withdrawal"
    );
    assert_eq!(
        admin_token_account.amount, withdraw_amount,
        "Admin's USDC balance incorrect after withdrawal"
    );
}
