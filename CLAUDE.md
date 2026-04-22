# Global AI Instructions

Before starting any feature development, analysis, or UI generation task, you MUST first read the following background documents to understand the system architecture, business logic, and routing mapping:
1. `docs/PROJECT_ARCHITECTURE.md`
2. `docs/SYSTEM_MODULES_MAP.md`

Always refer back to these documents and update them if you introduce new architectural changes or add new routes/menus.

## Menu Registration & Architecture Rule

When generating a new page, component, or standard List/CRUD interface:
1. **Understand Context**: Verify existing routing and business scopes in `docs/SYSTEM_MODULES_MAP.md`.
2. **Synchronize Documentation**: If you add a new route, update `menu.json` AND `docs/SYSTEM_MODULES_MAP.md` to reflect the new feature's place in the ecosystem.
3. **Execute Skill**: You MUST use the `Menu Management Skill` (located in `.agent/skills/menu_management/SKILL.md`) to automatically call the backend APIs and register the new menu entries.

## Tech Stack Reminder
- **Framework**: Vue 2.7.14 (supports Composition API style)
- **UI & State**: Element UI 2.15.9, Vuex 3.6.0, Vue Router 3.4.9
- **Build Tool**: Vue CLI / Webpack 5
