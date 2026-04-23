import { useReducedMotion } from "framer-motion"

import { MarketingPageScaffold } from "../../../components"
import { aboutPageContent } from "./about-page-editorial"
import { AboutFooterCta } from "./about-page-footer-cta"
import { AboutHero } from "./about-page-hero"
import { AboutSection01Interrogation } from "./about-page-section-interrogation"
import { AboutSection02TruthPositioning } from "./about-page-section-truth-positioning"
import { AboutSection03OperatingModel } from "./about-page-section-operating-model"
import { AboutSection04Principles } from "./about-page-section-principles"
import { AboutSection05Credibility } from "./about-page-section-credibility"

export default function AboutPage() {
  const reduceMotion = !!useReducedMotion()
  const { shell } = aboutPageContent

  return (
    <MarketingPageScaffold
      title={shell.title}
      tagline={shell.tagline}
      hero={<AboutHero reduceMotion={reduceMotion} />}
      sections={[
        <AboutSection01Interrogation
          key="about-section-01"
          reduceMotion={reduceMotion}
        />,
        <AboutSection02TruthPositioning
          key="about-section-02"
          reduceMotion={reduceMotion}
        />,
        <AboutSection03OperatingModel
          key="about-section-03"
          reduceMotion={reduceMotion}
        />,
        <AboutSection04Principles
          key="about-section-04"
          reduceMotion={reduceMotion}
        />,
        <AboutSection05Credibility
          key="about-section-05"
          reduceMotion={reduceMotion}
        />,
      ]}
      footer={<AboutFooterCta reduceMotion={reduceMotion} />}
    />
  )
}
