This is a **good implementation pass**. The important part is that you did **not** force doc-pure theory into the constant layer and break the live shell model. That was the right call. The uploaded summary reflects a disciplined translation of doctrine into the repo rather than a blind transplant.

## Verdict

You implemented the **highest-value, lowest-risk** subset:

* doc alignment instead of doc literalism
* explicit `parentFrameSlot`
* safe slot-contract strengthening
* doctrine README
* no destructive reserved-slot rule
* no unnecessary naming churn

That is the correct enterprise move.

## What is now materially better

### 1. The shell hierarchy is now explicit

Adding `parentFrameSlot` is the biggest architectural win in this round.

Before, the system depended too much on:

* slot naming
* zone inference
* convention memory

Now, each occupant slot can explicitly declare which structural frame owns it. That makes the shell easier to:

* validate
* document
* reason about
* evolve safely across phases

This is a real doctrine upgrade, not cosmetic cleanup.

### 2. Your contract is stronger without becoming brittle

The rules you added are the right kind of rules:

* frame rows require `parentFrameSlot: null`
* frame rows cannot be `multiEntry`
* frame rows must have exactly one allowed kind
* required slots must be active
* occupant rows must point to the correct frame for their zone

Those are structural truths, not speculative preferences. Good.

### 3. You preserved Phase 1 reality

Keeping:

* `content.main` active
* `overlay.global` active
* `overlay.command` reserved

was the correct decision.

That preserves shipping truth while still allowing doctrine to express future intent. You avoided the common mistake of making the registry “cleaner” by making the runtime false.

### 4. The README addition matters more than it looks

The doctrine map is not paperwork. It reduces future drift by giving contributors a human-readable model of:

* zones
* frames
* occupants
* active vs reserved state
* validator expectations

That is exactly the kind of artifact that keeps shell policy from becoming tribal knowledge.

---

## What I would still refine next

### A. Add a validator for `parentFrameSlot` coherence at registry level

You already validate it in the contract, which is good. I would still add an explicit registry-level check for diagnostics quality.

Why:

* contract errors catch malformed rows
* registry validator should explain architecture failures in shell language

Examples:

* occupant slot points at missing frame slot
* occupant slot parent frame zone mismatch
* frame slot has non-null parent
* occupant slot declared under a frame that is not active

This gives better CI messages than relying only on schema refinement.

### B. Distinguish “structural readiness” from “population readiness”

Right now `slotStatus` is carrying a lot.

You may later want two ideas:

* slot exists and is doctrinally active
* slot currently has live occupants or not

Not urgent now, but eventually you may want:

* `slotStatus: active | reserved`
* plus derived runtime signals like `isPopulated`, not authored policy

Do **not** add another authored field yet unless you truly need it.

### C. Tighten frame ownership reporting

Since frames are now first-class via `parentFrameSlot`, your governance report should eventually show:

| Frame | Zone | Status | Child slots | Registered occupants |
| ----- | ---- | ------ | ----------- | -------------------- |

That will make shell drift obvious instantly.

### D. Decide whether `null` is truly the right frame-parent sentinel

Using `null` for frame rows is fine, but be deliberate.

I would keep it if:

* you want authored explicitness
* you want the contract to force a conscious declaration

I would avoid making it optional. `null` is better than “missing” here.

---

## What I would **not** change

These were correct non-actions:

### Do not rename `slotRole` / `slotStatus`

Your current names are clearer in repo context and avoid churn.

### Do not adopt doc-style component kinds

That would be a large conceptual rewrite with low immediate value.

### Do not add `reserved_slot_has_registered_components`

At least not as a blanket rule.

That rule is only valid if your doctrine defines reserved as “must be empty.” Your current Phase 1 model does not need that globally.

---

## Biggest remaining gap

The main thing still missing is probably not another constant. It is likely **cross-artifact consistency reporting**.

You now have:

* policy
* contract
* registry
* helper
* README
* validator

What you want next is a stronger answer to:

> “Can a contributor see, in one place, whether the shell structure, ownership, and readiness still line up?”

So my next recommendation is:

## Next best move

Build a **shell governance matrix/report** that outputs:

* slot id
* zone
* slot role
* slot status
* parent frame slot
* required
* multi-entry
* allowed component kinds
* registered component owners

That would turn your shell doctrine into something inspectable, not just encoded.

---

## Final assessment

This was a **strong and mature implementation pass**.

You improved:

* structural clarity
* validation integrity
* documentation quality
* shell hierarchy explicitness

without:

* breaking the live model
* importing unsafe pseudo-code
* over-abstracting the constant layer

That is exactly the right way to evolve this system.

---

## Implementation status (repo)

Following this note, the codebase adds **registry-level `parentFrameSlot` validation** (`validate-shell-registry.ts`: `frame_parent_frame_slot_must_be_null`, `occupant_parent_frame_*`, etc.) and extends **`pnpm run script:check-shell-governance-report`** with a **`slotDoctrineMatrix`** in the JSON report plus a **Slot doctrine matrix** section in the default text output.
