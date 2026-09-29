# Agent Entry Point

Use [AI_CONTEXT.md](AI_CONTEXT.md) as the shared handoff for Gemini, Claude, ChatGPT, GitHub Copilot, and other coding agents working on Atheia.

Before editing, read the product map, local run commands, API contract, UI rules, and validation requirements there.

**Recent Updates:**
- The system now includes an automated adversarial evaluation harness in `backend/eval/run_eval.py`.
- The frontend operates on a Surrealist Design System using Framer Motion and Tailwind v4.
- Security protocols are enforced in `main.py` (strict MIME checks, async locks on jobs).
