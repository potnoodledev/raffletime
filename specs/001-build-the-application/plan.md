# Implementation Plan: RaffleTime WorldID-Powered Sweepstakes Platform

**Branch**: `001-build-the-application` | **Date**: 2025-09-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-build-the-application/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → Feature spec loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detected existing Next.js project with WorldCoin integration
   → Set Structure Decision based on project type (web application)
3. Evaluate Constitution Check section below
   → Constitution template is placeholder, applying general principles
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → No NEEDS CLARIFICATION remain in spec
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
6. Re-evaluate Constitution Check section
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Primary requirement: Build complete RaffleTime WorldID-powered sweepstakes platform with WLD token payments, soulbound NFT tickets, and charity beneficiary voting. Technical approach leverages existing Next.js + WorldCoin MiniKit foundation, extending with smart contracts, database persistence, and real payment processing.

## Technical Context
**Language/Version**: TypeScript 5, Next.js 14.2.6  
**Primary Dependencies**: WorldCoin MiniKit SDK 1.6.1, NextAuth 4.24.7, Viem 2.23.5, Tailwind CSS  
**Storage**: PostgreSQL with Prisma ORM (to be implemented)  
**Testing**: Jest + React Testing Library (to be implemented)  
**Target Platform**: Web application (responsive design for mobile/desktop)
**Project Type**: web - Next.js frontend with API routes backend  
**Performance Goals**: <200ms response times, handle 1000+ concurrent users, <100MB memory per raffle  
**Constraints**: WorldID verification required, WLD-only payments, soulbound NFTs, immutable raffle rules  
**Scale/Scope**: 10k+ users, 100+ concurrent raffles, real-time prize pools up to 100k WLD

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (Next.js app with API routes - no separate backend)
- Using framework directly? (Yes - Next.js without wrappers)
- Single data model? (Yes - shared types between frontend/backend)
- Avoiding patterns? (No Repository pattern - direct Prisma usage)

**Architecture**:
- EVERY feature as library? (Smart contracts as npm libraries, UI components modular)
- Libraries listed: 
  - raffle-contracts: Smart contract logic for raffles and NFTs
  - worldid-verification: WorldID proof verification utilities
  - payment-processing: WLD token transfer handling
- CLI per library: (Smart contract deployment/management CLIs)
- Library docs: llms.txt format planned for each library

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? (Tests written first for all new features)
- Git commits show tests before implementation? (Will enforce in tasks)
- Order: Contract→Integration→E2E→Unit strictly followed? (Yes)
- Real dependencies used? (Real blockchain networks, actual WLD tokens in staging)
- Integration tests for: Smart contract interactions, WorldID verification, payment flows
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? (Winston with JSON format)
- Frontend logs → backend? (Error boundary + API logging)
- Error context sufficient? (Full stack traces + user context)

**Versioning**:
- Version number assigned? (1.0.0 for MVP)
- BUILD increments on every change? (Automated via CI/CD)
- Breaking changes handled? (Smart contract upgrade patterns)

## Project Structure

### Documentation (this feature)
```
specs/001-build-the-application/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 2: Web application (existing Next.js structure extended)
app/                     # Next.js App Router
├── api/                 # API routes (existing + new)
├── raffles/             # Raffle pages
├── profile/             # User profile pages
└── admin/               # Admin dashboard

components/              # React components (extensive existing set)
├── RaffleList/          # Existing: raffle browsing
├── RaffleDetails/       # Existing: detailed raffle view
├── CreateRaffle/        # Existing: raffle creation form
├── Login/               # Existing: WorldID authentication
├── TicketPurchase/      # Existing: ticket buying interface
└── [new components]     # Prize claiming, NFT display, admin tools

lib/                     # Utilities and services
├── contracts/           # Smart contract interactions (NEW)
├── database/            # Database schemas and operations (NEW)
├── worldid/             # WorldID verification logic (extend existing)
├── payments/            # WLD token processing (NEW)
└── mock-data.ts         # Existing mock data (to be replaced)

types/                   # TypeScript definitions
└── raffle.ts            # Existing: comprehensive raffle types

tests/                   # Testing suite (NEW)
├── contracts/           # Smart contract tests
├── integration/         # API and component integration tests
├── e2e/                 # End-to-end user journey tests
└── unit/                # Component and utility unit tests
```

**Structure Decision**: Web application (Option 2) - extending existing Next.js structure

## Phase 0: Outline & Research

Based on the codebase analysis, existing Next.js + WorldCoin foundation eliminates most unknowns. Research focuses on blockchain integration and production readiness:

1. **Smart Contract Architecture**:
   - Research: Ethereum smart contract patterns for raffles
   - Research: Soulbound NFT implementation (ERC-721 extensions)
   - Research: Verifiable random number generation for winner selection

2. **Database Design**:
   - Research: PostgreSQL schema optimization for high-volume transactions
   - Research: Real-time data synchronization patterns
   - Research: Database indexing strategies for raffle queries

3. **Payment Processing**:
   - Research: WorldCoin WLD token integration patterns
   - Research: Transaction failure handling and retry logic
   - Research: Multi-signature wallet security for prize pools

**Output**: research.md with technical decisions and architecture patterns

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Extend existing Raffle, Ticket, User types with database mappings
   - Add Prize Distribution, Beneficiary Vote entities
   - Define state machine for raffle lifecycle transitions
   - Specify audit trail for all transactions

2. **Generate API contracts** from functional requirements:
   - Extend existing API routes with blockchain operations
   - Add smart contract interaction endpoints
   - Define WebSocket events for real-time updates
   - Output OpenAPI specification to `/contracts/api-spec.yaml`

3. **Generate smart contract interfaces**:
   - Raffle management contract specification
   - Soulbound NFT ticket contract specification
   - Prize distribution contract specification
   - Output Solidity interfaces to `/contracts/solidity/`

4. **Generate contract tests** from contracts:
   - Smart contract unit tests (Hardhat/Foundry)
   - API endpoint contract tests
   - Integration test scenarios for user flows
   - Tests must fail initially (TDD approach)

5. **Extract test scenarios** from user stories:
   - Complete raffle lifecycle integration tests
   - WorldID verification flow tests
   - Payment processing integration tests
   - Prize claiming and refund scenarios

6. **Update CLAUDE.md incrementally**:
   - Add smart contract development context
   - Include blockchain integration patterns
   - Document testing requirements and TDD approach
   - Keep focused on new implementation areas

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Build on existing UI foundation - enhance rather than rebuild
- Prioritize backend/blockchain gaps identified in codebase analysis
- Group related tasks for efficient development workflow
- Maintain TDD discipline throughout implementation

**Task Categories**:
1. **Database Layer** (5-7 tasks):
   - Prisma schema definition
   - Database migration scripts  
   - Data access layer implementation
   - Migration from mock data

2. **Smart Contracts** (8-10 tasks):
   - Contract development and testing
   - Deployment scripts and configuration
   - Frontend integration with contracts
   - Transaction handling and error recovery

3. **Payment Processing** (4-6 tasks):
   - WLD token integration
   - Payment flow implementation
   - Transaction confirmation handling
   - Refund mechanism development

4. **UI Enhancement** (6-8 tasks):
   - Connect existing UI to real data
   - Add missing admin interfaces
   - Implement real-time updates
   - Prize claiming interface

**Ordering Strategy**:
- Phase A: Database + Smart Contracts (foundation)
- Phase B: Payment Processing + Backend Integration  
- Phase C: UI Connection + Real-time Features
- Phase D: Testing + Production Readiness

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*No constitutional violations identified - existing architecture follows simplicity principles*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None identified | - | - |

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning approach defined (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (none in spec)
- [x] Complexity deviations documented (none identified)

---
*Based on Constitution template - See `/memory/constitution.md`*