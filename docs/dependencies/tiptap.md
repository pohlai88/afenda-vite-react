# Tiptap guide (Afenda)

This document describes **planned** **[Tiptap](https://tiptap.dev/)** (**ProseMirror**) for **rich text** in ERP surfaces (notes, agendas, long-form fields), with **sanitize** and **XSS** discipline at save boundaries.

**Status:** **Planned** — not in **`apps/web/package.json`**. Typical install: **`@tiptap/react`**, **`@tiptap/pm`**, **`@tiptap/starter-kit`**; add **`@tiptap/extension-*`** only as needed.

**Official documentation:**

- [Tiptap](https://tiptap.dev/) — product and editor hub
- [Install (overview)](https://tiptap.dev/docs/editor/getting-started/install) — pick **Vanilla / React / …**
- [React + Vite](https://tiptap.dev/docs/editor/getting-started/install/react) — **`useEditor`**, **`EditorContent`**, **`StarterKit`**, **`EditorContext`** / **`useCurrentEditor`**, **`useEditorState`**, SSR **`immediatelyRender: false`**
- [Configure](https://tiptap.dev/docs/editor/getting-started/configure) · [Style the editor](https://tiptap.dev/docs/editor/getting-started/style-editor)
- [Core concepts](https://tiptap.dev/docs/editor/core-concepts/introduction) · [Persistence](https://tiptap.dev/docs/editor/core-concepts/persistence)
- [Extensions (index)](https://tiptap.dev/docs/editor/extensions) — nodes, marks, functionality
- [StarterKit](https://tiptap.dev/docs/editor/extensions/functionality/starterkit) — bundled baseline extensions
- [Mention](https://tiptap.dev/docs/editor/extensions/nodes/mention) — `@user`-style nodes (customize for internal refs)
- [Editor class API](https://tiptap.dev/docs/editor/api/editor) — **`getJSON()`**, **`getHTML()`**, **`getText()`**, **`editorProps`** (paste/transform), **`textDirection`** (RTL)
- [Custom extensions](https://tiptap.dev/docs/editor/extensions/custom-extensions)
- [React performance](https://tiptap.dev/docs/guides/performance) · [React Composable API](https://tiptap.dev/docs/guides/react-composable-api)
- [ProseMirror](https://prosemirror.net/) — underlying model
- [Tiptap on GitHub](https://github.com/ueberdosis/tiptap)

Some **collaboration**, **AI**, and **export** features are **commercial** add-ons—see labels on [Extensions](https://tiptap.dev/docs/editor/extensions); ERP **MVP** can stay on open-source pieces until product needs them.

---

## How we use Tiptap

| Topic | Convention |
| --- | --- |
| **Persistence** | Prefer **JSON** (**`editor.getJSON()`**) for a stable, schema-friendly blob; if you store **HTML**, treat it as **untrusted** until sanitized ([Persistence](https://tiptap.dev/docs/editor/core-concepts/persistence), [Editor API](https://tiptap.dev/docs/editor/api/editor)) |
| **XSS** | **Allowlist** nodes/marks via extensions; **server-side** sanitize before persist; align with [API](../API.md) rich-text fields |
| **Paste** | Review **paste rules** / **`editorProps.transformPastedHTML`** (or disable risky paste paths)—[Editor API](https://tiptap.dev/docs/editor/api/editor) |
| **Mentions** | **[Mention extension](https://tiptap.dev/docs/editor/extensions/nodes/mention)** or custom nodes for `@skill` / internal refs—match 1:1 agenda examples in [API](../API.md) |
| **a11y** | Toolbar **keyboard** operable; consider **`textDirection: 'auto'`** for mixed RTL/LTR ([Design system](../DESIGN_SYSTEM.md), [Editor API](https://tiptap.dev/docs/editor/api/editor)) |
| **Performance** | Follow [React performance](https://tiptap.dev/docs/guides/performance); avoid unnecessary re-renders from editor state in large surfaces |

---

## Red flags

- **Storing** raw HTML from the editor **without** sanitization.
- **Pasting** untrusted content without pipeline review (**`enablePasteRules`**, ProseMirror parse pipeline).
- **Shipping** every **StarterKit** extension to production without an **allowlist** review (e.g. arbitrary links, images).

---

## Related documentation

- [Vite](./vite.md)
- [Components and styling](../COMPONENTS_AND_STYLING.md)
- [API reference](../API.md)

**External:** [tiptap.dev](https://tiptap.dev/) · [GitHub](https://github.com/ueberdosis/tiptap)

**Context7 (AI doc refresh):** **`Tiptap`** → **`/ueberdosis/tiptap-docs`** (structured) or **`/llmstxt/tiptap_dev_llms_txt`** (broad). Then **`query-docs`** for React setup, **`getJSON`**, Mention, or collaboration.
