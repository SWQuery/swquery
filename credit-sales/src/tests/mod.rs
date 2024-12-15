#[cfg(test)]
mod test {
    use std::vec;

    use mollusk_svm::{result::Check, Mollusk};
    use solana_sdk::{
        account::{AccountSharedData, ReadableAccount, WritableAccount},
        instruction::{AccountMeta, Instruction},
        program_option::COption,
        program_pack::Pack,
        pubkey::Pubkey,
        system_program,
        sysvar::{Sysvar, SysvarId},
    };
    use spl_token::state::AccountState;

    use crate::state::CreditsAccount;

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
            owner: *authority, // Set the authority here
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

    #[test]
    fn test_withdraw_usdc() {
        let (program_id, mut mollusk) = setup();
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
            "11111111111111111111111111111111111111111111",
        ));
        let usdc_mint_account = pack_mint(&mint_authority, 1_000_000);

        let (treasury_pda, treasury_bump) =
            Pubkey::find_program_address(&[b"treasury"], &program_id);
        let treasury_account = pack_token_account(
            &admin,     // owner
            &usdc_mint, // mint
            1_000_000,  // initial USDC in treasury
        );

        let admin_usdc = Pubkey::new_unique();
        let mut admin_usdc_account = pack_token_account(
            &admin,     // owner
            &usdc_mint, // mint
            0,          // initial amount
        );

        let withdraw_amount = 500_000u64;
        let data = [
            vec![2],
            withdraw_amount.to_le_bytes().to_vec(),
            treasury_bump.to_le_bytes().to_vec(),
        ]
        .concat();

        let instruction = Instruction {
            program_id,
            accounts: vec![
                AccountMeta::new(treasury_pda, false), // Treasury account
                AccountMeta::new(admin_usdc, false),   // Admin's USDC account
                AccountMeta::new(admin, true),         // Admin account (signer)
                AccountMeta::new_readonly(token_program, false), // Token program
            ],
            data,
        };

        let accounts = vec![
            (treasury_pda, treasury_account.clone()), // Treasury account
            (admin_usdc, admin_usdc_account.clone()), // Admin's USDC account
            (
                admin,
                AccountSharedData::new(
                    1_000_000,             // lamports as needed
                    0,                     // data length; assuming no data
                    &system_program::id(), // Owner can be system_program or another as per your setup
                ),
            ),
            (token_program, token_program_account.clone()), // Token program
        ];

        let result =
            mollusk.process_and_validate_instruction(&instruction, &accounts, &[Check::success()]);

        assert!(
            !result.program_result.is_err(),
            "WithdrawUSDC instruction failed",
        );

        // Retrieve updated accounts
        // let updated_treasury = result.get_account(&treasury_pda).unwrap();
        // let updated_admin_usdc = result.get_account(&admin_usdc).unwrap();

        // // Unpack token accounts to verify balances
        // let treasury_token_account = TokenAccount::unpack(&updated_treasury.data)
        //     .expect("Failed to unpack treasury token account");
        // let admin_token_account = TokenAccountState::unpack(&updated_admin_usdc.data)
        //     .expect("Failed to unpack admin token account");

        // // Verify treasury's USDC balance decreased by the withdrawal amount
        // assert_eq!(
        //     treasury_token_account.amount,
        //     1_000_000 - withdraw_amount,
        //     "Treasury USDC balance did not decrease correctly"
        // );

        // // Verify admin's USDC balance increased by the withdrawal amount
        // assert_eq!(
        //     admin_token_account.amount, withdraw_amount,
        //     "Admin USDC balance did not increase correctly"
        // );

        // // Verify that the treasury PDA is correctly set up
        // assert_eq!(
        //     treasury_token_account.mint, usdc_mint,
        //     "Treasury token account mint mismatch"
        // );
        // assert_eq!(
        //     treasury_token_account.owner, &admin,
        //     "Treasury token account owner mismatch"
        // );
    }
}
