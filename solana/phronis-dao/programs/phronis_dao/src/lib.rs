//! Phronis DAO — L1 anchor for governance state (stub).
//! Extend with proposals, votes, and treasury PDAs; wire `NEXT_PUBLIC_PHRONIS_DAO_PROGRAM_ID` in the web app.

use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFRSn");

#[program]
pub mod phronis_dao {
    use super::*;

    /// Initializes the singleton DAO config PDA (authority + minimum vote weight placeholder).
    pub fn initialize_dao(ctx: Context<InitializeDao>, min_vote_weight: u64) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        dao.authority = ctx.accounts.authority.key();
        dao.min_vote_weight = min_vote_weight;
        dao.bump = ctx.bumps.dao;
        Ok(())
    }

    /// Updates vote threshold; only authority may call.
    pub fn set_min_vote_weight(ctx: Context<UpdateDao>, min_vote_weight: u64) -> Result<()> {
        ctx.accounts.dao.min_vote_weight = min_vote_weight;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeDao<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + DaoState::INIT_SPACE,
        seeds = [b"phronis_dao"],
        bump
    )]
    pub dao: Account<'info, DaoState>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateDao<'info> {
    #[account(
        mut,
        seeds = [b"phronis_dao"],
        bump = dao.bump,
        has_one = authority @ DaoError::Unauthorized
    )]
    pub dao: Account<'info, DaoState>,
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct DaoState {
    pub authority: Pubkey,
    pub min_vote_weight: u64,
    pub bump: u8,
}

#[error_code]
pub enum DaoError {
    #[msg("Signer is not the DAO authority")]
    Unauthorized,
}
