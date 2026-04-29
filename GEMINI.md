# Global AI Instructions

This repository uses shared instructions for Gemini, Codex, and Claude.

Before starting any feature development, analysis, debugging, UI generation, routing change, or documentation task, you MUST first read:

1. `docs/AGENTS.md`
2. `docs/PROJECT_ARCHITECTURE.md`
3. `docs/SYSTEM_MODULES_MAP.md`
4. `.agent/rules/project_rules.md`

If the target page or any parent folder contains `README.md` or `README.MD`, you MUST read it before making changes or conclusions.

Always update the related docs when introducing architectural changes, new routes, menus, or module-level behavior.

## Menu Registration & Architecture Rule

When generating a new page, component, route, menu, or standard List/CRUD interface:

1. Verify the existing routing and business scope in `docs/SYSTEM_MODULES_MAP.md`.
2. Update `menu.json`, `docs/SYSTEM_MODULES_MAP.md`, and the relevant module README.
3. Do not automatically use the `Menu Management Skill` located at `.agent/skills/menu_management/SKILL.md`. Only run it when the user explicitly asks to register menus/permissions or explicitly requests this skill.

## Tech Stack Reminder

- Framework: Vue 2.7.14
- UI & State: Element UI 2.15.9, Vuex 3.6.0, Vue Router 3.4.9
- Build Tool: Vue CLI / Webpack 5
