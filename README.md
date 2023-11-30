# ERC4626 Token Vault Indexer

This repository contains an indexer for OpenZeppelin Tokenized Vault Contracts (ERC4626) that facilitates easy querying and presentation of tokenized vault events through a custom GraphQL API with [Envio](https://docs.envio.dev).

## Schema and Event Details

The schema includes three main types: `TokenVault`, `Deposit`, and `Withdrawal`. The `TokenVault` type stores information about the tokenized vault, such as assets, shares, proportions, and exchange rates. `Deposit` and `Withdrawal` types capture details about corresponding events, including sender, owner, assets, shares, and the associated vault.

### Event Occurrence:

- **Deposit Event**: Captures details when liquidity is added to the vault.
- **Withdrawal Event**: Records information when liquidity is removed from the vault.

## Setup

1. Install [Envio CLI](https://docs.envio.dev/docs/installation) by following the installation instructions.

2. Clone this repository:
```bash
git clone https://github.com/en0c-026/erc4626-indexer
cd erc4626-indexer
```

3. Install dependencies:
```bash
npm install
```

4. Configure config.yaml:
- Update the `address` field your ERC4626 contract address.
- If necessary update the newtork `id`.

## Build and Run

To build the indexer and generate types:
```bash
envio codegen
```

To run the indexer:
```bash
envio dev
```
