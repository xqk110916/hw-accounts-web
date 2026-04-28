# Global AI Instructions

This file is the Claude entry point. The same baseline rules are mirrored for Codex in `AGENTS.md` and Gemini in `GEMINI.md`.

Before starting any feature development, analysis, debugging, UI generation, routing change, or documentation task, you MUST first read the following background documents to understand the system architecture, business logic, and routing mapping:
1. `docs/AGENTS.md`
2. `docs/PROJECT_ARCHITECTURE.md`
3. `docs/SYSTEM_MODULES_MAP.md`
4. `.agent/rules/project_rules.md`

If the target page or any parent folder contains `README.md` or `README.MD`, you MUST read it before making changes or conclusions. This is mandatory for business background and page-specific constraints.

When the user provides no extra context, default to reading `/docs` rules and the target module README before taking action.

Always refer back to these documents and update them if you introduce new architectural changes, module behavior changes, or add new routes/menus.

## Menu Registration & Architecture Rule

When generating a new page, component, or standard List/CRUD interface:
1. **Understand Context**: Verify existing routing and business scopes in `docs/SYSTEM_MODULES_MAP.md`.
2. **Synchronize Documentation**: If you add a new route, update `menu.json`, `docs/SYSTEM_MODULES_MAP.md`, and the relevant module README to reflect the new feature's place in the ecosystem.
3. **Execute Skill**: You MUST use the `Menu Management Skill` (located in `.agent/skills/menu_management/SKILL.md`) to automatically call the backend APIs and register the new menu entries.

## Tech Stack Reminder
- **Framework**: Vue 2.7.14 (supports Composition API style)
- **UI & State**: Element UI 2.15.9, Vuex 3.6.0, Vue Router 3.4.9
- **Build Tool**: Vue CLI / Webpack 5
