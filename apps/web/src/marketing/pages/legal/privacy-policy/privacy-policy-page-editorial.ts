export const privacyPolicyEditorial = {
  shell: {
    title: "Privacy Policy",
    tagline: "Purpose-bound handling, visible controls, and reviewable posture",
  },

  opening: {
    eyebrow: "Legal",
    headline:
      "Privacy should read as a control model, not a wall of disclaimers.",
    thesis:
      "Afenda's public privacy surface should explain how data handling intent, access responsibility, and control posture are structured. It should help the reader understand the operating logic before policy detail expands.",
    annotation:
      "Privacy becomes harder to trust when it is written as detached reassurance instead of a visible relationship between purpose, access, protection, and review.",
    rails: [
      "Purpose-bound data handling",
      "Visible access boundaries",
      "Protection by control",
      "Review readiness",
    ],
  },

  posture: {
    title:
      "The public privacy page should expose how data responsibility is framed.",
    body: [
      "Collection and processing only make sense when they can be legibly tied to a real business purpose.",
      "Readers also need to understand who can see sensitive information, under what operating responsibility, and how protection measures map to actual controls.",
      "A privacy surface should therefore read as a governance explanation, not as a static legal dead end.",
    ],
    matrix: [
      {
        title: "Purpose",
        detail:
          "Data handling starts with a declared business reason rather than with generalized entitlement to collect.",
      },
      {
        title: "Access",
        detail:
          "Visibility boundaries should reflect role, responsibility, and operational need.",
      },
      {
        title: "Protection",
        detail:
          "Security language should correspond to concrete control posture instead of vague reassurance.",
      },
      {
        title: "Escalation",
        detail:
          "The page should guide readers toward the next relevant control surface when scrutiny increases.",
      },
    ],
  },

  controlChain: {
    title:
      "Privacy stays credible when the control chain remains visible from intent to review.",
    intro:
      "The privacy surface should show how responsibility and safeguards hold together under real operating conditions.",
    chain: [
      {
        label: "Intent",
        description:
          "A valid business purpose frames why the system is handling information at all.",
      },
      {
        label: "Boundary",
        description:
          "Access is limited by role and responsibility before sensitive data becomes ambient.",
      },
      {
        label: "Control",
        description:
          "Protection measures govern handling behavior rather than appearing as detached claims.",
      },
      {
        label: "Review",
        description:
          "Readers and reviewers can follow the privacy posture into trust and regional policy surfaces without losing context.",
      },
    ],
    note: "A privacy page should make control comprehension easier, not force readers to infer the operating model on their own.",
  },

  cta: {
    title: "Follow the privacy posture into PDPA and trust governance.",
    body: "Privacy routes should help the reader reach the next relevant control surface instead of stopping at static policy language.",
    actions: [
      {
        label: "Open PDPA",
        to: "/marketing/legal/pdpa",
      },
      {
        label: "Visit Trust Center",
        to: "/marketing/legal/trust-center",
      },
    ],
    note: "This route now carries a clearer privacy-control structure inside the broader legal tree.",
  },
} as const
