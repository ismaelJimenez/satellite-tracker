<!--
## Sync Impact Report
- Version change: N/A (initial) → 1.0.0
- Modified principles: N/A (initial ratification)
- Added sections: Core Principles (4), Performance Standards, Development Workflow, Governance
- Removed sections: N/A
- Templates requiring updates:
  - plan-template.md: ✅ compatible (Constitution Check section present)
  - spec-template.md: ✅ compatible (User Scenarios align with testing principles)
  - tasks-template.md: ✅ compatible (test task phases align with Test-First principle)
- Follow-up TODOs: None
-->

# SAT Project Constitution

## Core Principles

### I. Code Quality First

All code MUST meet established quality standards before merge:

- **Static Analysis**: Code MUST pass linting and type checking with zero errors
- **Clean Architecture**: Modules MUST have single responsibility; dependencies MUST flow inward
- **Documentation**: Public APIs MUST include docstrings; complex logic MUST include inline comments
- **Code Review**: All changes MUST receive at least one approval before merge
- **No Dead Code**: Unused imports, variables, and functions MUST be removed

**Rationale**: Technical debt compounds exponentially. Enforcing quality at the gate prevents
degradation and maintains long-term velocity.

### II. Test-First Development (NON-NEGOTIABLE)

Tests MUST be written and approved before implementation begins:

- **Red-Green-Refactor**: Write failing test → implement minimal code → refactor
- **Coverage Requirements**: New code MUST achieve ≥80% line coverage; critical paths MUST have 100%
- **Test Types Required**:
  - Unit tests for all business logic
  - Integration tests for cross-module interactions
  - Contract tests for external API boundaries
- **Test Independence**: Each test MUST be isolated and repeatable without external state

**Rationale**: Tests written after implementation tend to verify implementation rather than
requirements. Test-first ensures behavior is specified before code exists.

### III. User Experience Consistency

All user-facing interfaces MUST maintain consistent behavior and appearance:

- **Design System**: UI components MUST use established patterns and tokens
- **Error Handling**: User-facing errors MUST be actionable and human-readable
- **Loading States**: Async operations MUST provide feedback within 100ms
- **Accessibility**: All interfaces MUST meet WCAG 2.1 AA compliance minimum
- **Responsive Design**: Interfaces MUST function across supported viewport sizes
- **Predictable Behavior**: Similar actions MUST produce similar outcomes across the application

**Rationale**: Inconsistent UX erodes user trust and increases cognitive load. Consistency
reduces learning curve and support burden.

### IV. Performance by Design

Performance MUST be considered during design, not retrofitted:

- **Response Time Targets**:
  - User interactions: <100ms perceived response
  - API calls: <200ms p95 latency
  - Page loads: <1s Time to Interactive
- **Resource Budgets**: Define memory and CPU budgets per feature during planning
- **Monitoring**: All production code MUST emit performance metrics
- **Regression Prevention**: Performance tests MUST run in CI; regressions MUST block merge
- **Efficient Algorithms**: O(n²) or worse complexity MUST be justified and documented

**Rationale**: Performance is a feature. Users equate speed with quality. Retrofitting
performance is 10x more expensive than designing for it.

## Performance Standards

Quantitative thresholds that MUST be met for production deployment:

| Metric | Target | Threshold |
|--------|--------|-----------|
| API p50 latency | <50ms | <100ms |
| API p95 latency | <100ms | <200ms |
| API p99 latency | <200ms | <500ms |
| Error rate | <0.1% | <1% |
| Memory per request | <50MB | <100MB |
| CPU per request | <100ms | <250ms |
| Time to Interactive | <500ms | <1s |

- **Target**: Ideal performance level to aim for
- **Threshold**: Maximum acceptable; exceeding MUST block deployment

## Development Workflow

### Quality Gates

Every PR MUST pass these gates before merge:

1. **Lint Gate**: Zero linting errors or warnings
2. **Type Gate**: Full type coverage, no `any` escapes without justification
3. **Test Gate**: All tests pass; coverage thresholds met
4. **Performance Gate**: No performance regressions detected
5. **Review Gate**: At least one approval from code owner

### Branch Strategy

- `main`: Production-ready code only
- `develop`: Integration branch for features
- `feature/*`: Individual feature branches
- `hotfix/*`: Emergency production fixes

### Commit Standards

- Commits MUST follow Conventional Commits format
- Commits MUST be atomic (one logical change per commit)
- Commit messages MUST be descriptive and reference issues when applicable

## Governance

This constitution supersedes all other development practices. Conflicts MUST be resolved
in favor of constitution principles.

### Amendment Process

1. **Proposal**: Submit amendment request with rationale and impact analysis
2. **Review**: Minimum 3-day review period for team feedback
3. **Approval**: Requires consensus from project maintainers
4. **Migration**: Breaking changes MUST include migration plan and timeline

### Compliance

- All PRs MUST include constitution compliance verification
- Violations MUST be documented and resolved before merge
- Exceptions MUST be justified, time-boxed, and tracked as tech debt

### Versioning

Constitution versions follow Semantic Versioning:
- **MAJOR**: Backward-incompatible principle changes or removals
- **MINOR**: New principles or expanded guidance
- **PATCH**: Clarifications and non-semantic refinements

**Version**: 1.0.0 | **Ratified**: 2026-02-22 | **Last Amended**: 2026-02-22
